cdkp
====

CLI tool for cdkpatterns.com to make it as simple as one command to download and learn a new pattern. This tool will only download the one pattern you are interested in rather than the whole repo.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Downloads](https://img.shields.io/npm/dt/cdkp)](https://npmjs.org/package/cdkp)


## Requirements

You must have git installed on your system as this is what is used to download the pattern. This uses the code at cdkpatterns.com, there is no external api.

## Usage

### Downloading a pattern

`npx cdkp init {pattern-name}`

pattern-name is the string name of any of the existing patterns on cdkpatterns.com with - instead of spaces e.g.

* `npx cdkp init the-big-fan`
* `npx cdkp init the-simple-webservice`
* `npx cdkp init the-eventbridge-atm`

### Viewing Available Patterns

you can view all available patterns by using the list command:

* `npx cdkp list`

### Advanced Usage

If you want to download the python version of a pattern you just need to include the --lang=python flag in the command:

* `npx cdkp init the-big-fan --lang=python`

You can also only init a pattern into a directory once because the second time would wipe the contents of the folder. There is a -f flag if you really want to wipe the contents e.g.

* `npx cdkp init the-big-fan -f`

If a folder called the-big-fan already existed in the directory you ran the command because you added the force flag it will be wiped
