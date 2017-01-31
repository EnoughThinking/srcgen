#!/usr/bin/env node
var srcgen = require('../index');
var path = require('path');
var clear = require('clear');
var chalk = require('chalk');
var figlet = require('figlet');
var program = require('commander');

program
    .version('0.2.1')
    .parse(process.argv);

if (program.args.length === 0) {
    clear();
    console.log(
        chalk.green(
            figlet.textSync('srcgen', { horizontalLayout: 'full' })
        )
    );
    console.log('');
    srcgen.generator.run(path.resolve(process.cwd()));
}