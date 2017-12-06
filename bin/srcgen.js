#!/usr/bin/env node
var srcgen = require('../index');
var path = require('path');
var clear = require('clear');
var chalk = require('chalk');
var figlet = require('figlet');
var program = require('commander');

program
    .version('0.3.3')
    .option('-l, --show-templates', 'Show exists templates')
    .option('-t, --build-template [value]', 'Build from template')
    .option('-f, --input-file [value]', 'File name with input data')
    //.option('-i, --input-data [value]', 'Input data')
    .option('-d, --dest-path [value]', 'Destination path')
    .option('-x, --ignore-confirm', 'Hide confirm for run template')
    .option('-s, --save-input-file [value]', 'Path to save all answers for reuse it')
    .parse(process.argv);

//if (program.args.length === 0) {
if (program.showTemplates !== true && program.ignoreConfirm !== true) {
    clear();
    console.log(
        chalk.green(
            figlet.textSync('srcgen', { horizontalLayout: 'full' })
        )
    );
    console.log('');
}
srcgen.generator.run(
    path.resolve(process.cwd()),
    program.showTemplates,
    program.buildTemplate,
    program.inputFile,
    program.inputData,
    program.destPath,
    program.ignoreConfirm,
    program.saveInputFile
);
//}