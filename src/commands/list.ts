import {Command, flags} from '@oclif/command'
const { execSync } = require('child_process');
const fs = require('fs-extra');
const https = require('https');
import * as path from 'path';

export default class List extends Command {
  static description = 'takes a pattern name as a parameter and clones it from cdkpatterns.com'

  static examples = [
    `$ cdkp list
`,
  ]

  static flags = {

  }

  static args = [{name: 'pattern'}]

  async run() {
    const {args, flags} = this.parse(List)

    let that = this;

    https.get('https://raw.githubusercontent.com/cdk-patterns/serverless/master/info.json', (resp:any) => {
      let data = '';

      // A chunk of data has been recieved.
      resp.on('data', (chunk:any) => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        let cdkinfo:any = JSON.parse(data);
        let prodPatterns = [];
        let learningPatterns = [];

        for(var pattern in cdkinfo.patterns) {
          if(cdkinfo.patterns[pattern].prodReady === true) {
            prodPatterns.push(pattern)
          }else {
            learningPatterns.push(pattern);
          }
        }
        
        if(prodPatterns.length > 0) {
          that.log('Production Ready Patterns')
          for(var pattern in prodPatterns) {
            that.log('- '+prodPatterns[pattern]);
          }
          that.log('\n');
        }

        if(learningPatterns.length > 0){
          that.log('Patterns Designed For Learning (i.e. need tweaks before prod use)')
          for(var pattern in learningPatterns) {
            that.log('- '+learningPatterns[pattern]);
          }
        }
      });

    }).on("error", (err:any) => {
      that.error(err.message)
    });
  }
}
