import {Command, flags} from '@oclif/command'
const { execSync } = require('child_process');
const fs = require('fs-extra');
import * as path from 'path';
const https = require('https');

export default class Init extends Command {
  static description = 'takes a pattern name as a parameter and clones it from cdkpatterns.com'

  static examples = [
    `$ cdkp init the-big-fan
  *** Downloading Pattern ***
  From https://github.com/cdk-patterns/serverless
    * [new branch]      master     -> origin/master
  From https://github.com/cdk-patterns/serverless
    * branch            master     -> FETCH_HEAD
  *** Tidying up file structure ***
  *** Installing Dependencies and Building ***
  npm WARN the-big-fan@0.1.0 No repository field.
  npm WARN the-big-fan@0.1.0 No license field.
  
  *** Complete, pattern is inside the-big-fan folder ***
  
  Useful Commands:
  - "cd the-big-fan" to open the pattern in your cli
  - "npm run cdk synth" to see the generated cft
  - "npm run test" to run the unit tests
  - "npm run deploy" to deploy to aws
`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),

    // flag with no value (-f, --force)
    force: flags.boolean({char: 'f'}),

    // language flag for the patterm, typescript or python
    lang: flags.string({char: 'l', description:"typescript or python"}),
  }

  static args = [{name: 'pattern'}]

  async run() {
    const {args, flags} = this.parse(Init)
    const pattern = args.pattern || null;
    const force = flags.force || false;
    let lang = flags.lang || 'typescript';
    const base_dir = path.join(process.cwd(), pattern);

    lang = lang.toLowerCase();

    if(lang !== 'typescript' && lang !== 'python') {
      this.error('only typescript and python are supported');
    }

    this.getAvailablePatterns().then(async (patterns)=> {
      if(!patterns.includes(pattern)){
        this.log(pattern+' is not a valid pattern, try cdkp list to see available patterns')
        return;
      }

      try {
        if ((fs.existsSync('./'+pattern)) && (force === false)) {
          //file exists
          this.log(pattern+ ' folder already exists, you can only add a pattern once')
        }else {
          if(force === true) {
            this.log('Deleting previous '+pattern+ ' folder from '+base_dir);
          }
  
          fs.emptyDirSync(pattern)
          this.log('*** Dowloading Pattern ***');
          execSync('git init', {'cwd': pattern});
          execSync('git remote add origin -f https://github.com/cdk-patterns/serverless', {'cwd': pattern});
          execSync('git config core.sparsecheckout true', {'cwd': pattern});
          execSync('echo '+pattern+'/'+lang+' >> .git/info/sparse-checkout', {'cwd': pattern});
          execSync('git pull origin master', {'cwd': pattern});
  
          this.log('*** Tidying up file structure ***');
          fs.removeSync(path.join(base_dir, '.git'))
          await this.copyFiles(path.join(base_dir, pattern, lang), base_dir)
          fs.removeSync(path.join(base_dir, pattern))
  
          if(lang === 'typescript'){
            this.log('*** Installing Dependencies and Building (This can take a couple of mins depending on pattern) ***');
            execSync('npm i && npm run build', {'cwd': pattern});
            this.log('*** Complete, pattern is inside '+base_dir+' folder ***\n');
            this.log('Useful Commands:');
            this.log('- "cd '+pattern+'" to open the pattern in your cli');
            this.log('- "npm run cdk synth" to see the generated cft');
            this.log('- "npm run test" to run the unit tests');
            this.log('- "npm run deploy" to deploy to aws');
          } else {
            this.log('*** Complete, pattern is inside '+base_dir+' folder ***\n');
            this.log('You still need to create your venv and install the dependencies as per the readme');
            this.log('Useful Commands:');
            this.log('- "cd '+pattern+'" to open the pattern in your cli');
          }
  
          
        }
      } catch(err) {
        this.error(err)
      }
    })
    
  }

  private getAvailablePatterns():Promise<string[]>  {
    return new Promise<string[]>((resolve, reject) => {
      https.get('https://raw.githubusercontent.com/cdk-patterns/serverless/master/info.json', (resp:any) => {
      let data = '';

      // A chunk of data has been recieved.
      resp.on('data', (chunk:any) => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        let cdkinfo:any = JSON.parse(data);
        resolve(Object.keys(cdkinfo.patterns));
      });

      }).on("error", (err:any) => {
        reject(err.message)
      });
    }); 
  }

  private async copyFiles(sourceDirectory: string, targetDirectory: string) {
    for (const file of await fs.readdir(sourceDirectory)) {
      const fromFile = path.join(sourceDirectory, file);
      const toFile = path.join(targetDirectory, file);
      if ((await fs.stat(fromFile)).isDirectory()) {
        await fs.mkdir(toFile);
        await this.copyFiles(fromFile, toFile);
        continue;
      } else {
        await fs.copy(fromFile, toFile);
      }
    }
  }
}
