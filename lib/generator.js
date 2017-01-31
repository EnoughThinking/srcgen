'use strict';

exports.__esModule = true;

var extractor = require('./extractor');
var builder = require('./builder');
var utils = require('./utils');
var mkdirp = require('mkdirp');
var path = require('path');
var _ = require('lodash');
var recursive = require('recursive-readdir-synchronous');
var inquirer = require('inquirer');
var objectPath = require('object-path');

var generator = {};
generator.buildTemplate = function (srcPath, destPath, inputData) {
    return new Promise(function (resolve, reject) {
        extractor.folder.prompt(srcPath, inputData).then(function (promptedData) {
            try {
                var replacers = [];
                Object.keys(promptedData.variables).map(function (key) {
                    var variable = promptedData.variables[key];
                    variable.map(function (obj) {
                        replacers.push({ from: obj.outer, to: obj.inner });
                    });
                });
                Object.keys(promptedData.variables).map(function (key) {
                    var variable = promptedData.variables[key];
                    variable.map(function (obj) {
                        replacers.push({ from: `%${obj.name}%`, to: obj.inner });
                    });
                });
                Object.keys(promptedData.data).map(function (key) {
                    if (typeof promptedData.data[key] !== 'object' && !Array.isArray(promptedData.data[key])) {
                        replacers.push({ from: `%${key}%`, to: promptedData.data[key] });
                    }
                });
                Object.keys(promptedData.variables).map(function (key) {
                    var variable = promptedData.variables[key];
                    variable.map(function (obj) {
                        if (variable.length === 1) {
                            objectPath.set(promptedData.data, key, obj.inner);
                        }
                    });
                });
                builder.setReplacers(replacers);
                builder.folder.all(
                    srcPath,
                    destPath,
                    promptedData.data
                );
                resolve(true);
            } catch (error) {
                reject(error);
            }
        }).catch(function (error) {
            reject(error);
        });
    });
}
generator.searchTemplates = function (templatesPath) {
    try {
        function ignoreFunc(file, stats) {
            return !stats.isDirectory() && path.basename(file) !== 'srcgen.conf.json';
        }
        var templates = recursive(templatesPath, [ignoreFunc]);
        templates = templates.map(function (templateConfig) {
            var data = JSON.parse(utils.load(templateConfig));
            data.path = path.dirname(templateConfig);
            return data;
        });
        return templates;
    } catch (error) {
        console.error(error);
    }
}
generator.templateChoicer = function (templates) {
    return new Promise(function (resolve, reject) {
        try {
            var choices = [];
            templates.map(function (template, index) {
                choices.push({
                    name: `${index + 1}) ${template.name} - ${template.description}`,
                    value: template
                });
            });
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'template',
                    message: 'Select template for run:',
                    choices: choices
                }
            ]).then(function (answers) {
                resolve(answers);
            });
        } catch (error) {
            reject(error);
        }
    });
}
generator.actionChoicer = function (templates) {
    return new Promise(function (resolve, reject) {
        try {
            var choices = [];
            var choicesIndex = 1;
            if (templates.length > 0) {
                choices.push({
                    name: `${choicesIndex}) Build from template`,
                    value: 'build-from-template'
                });
                choicesIndex++;
            }
            if (choicesIndex > 1) {
                choices.push({
                    name: `${choicesIndex}) Create new template`,
                    value: 'create-template'
                });
            } else {
                choices.push({
                    name: `Create new template`,
                    value: 'create-template'
                });
            }
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: 'Select action:',
                    choices: choices
                }
            ]).then(function (answers) {
                resolve(answers);
            });
        } catch (error) {
            reject(error);
        }
    });
}
generator.checkTemplatesPath = function (templatesPath) {
    return new Promise(function (resolve, reject) {
        try {
            if (!utils.exists(templatesPath)) {
                inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'createTemplatesPath',
                        message: `Templates path not found (${templatesPath}), create it?`
                    }
                ]).then(function (answers) {
                    if (answers.createTemplatesPath) {
                        mkdirp.sync(templatesPath);
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
            } else {
                resolve(true);
            }
        } catch (err) {
            reject(err);
        }
    });
}
generator.run = function (workPath) {
    var answers = {};
    var templatesPath = "";
    workPath = path.resolve(workPath);
    templatesPath = path.resolve(workPath, './srcgen');
    generator.checkTemplatesPath(templatesPath).then(function (created) {
        if (created === false) {
            templatesPath = path.resolve(workPath);
        }
        var templates = generator.searchTemplates(templatesPath);
        generator.actionChoicer(templates).then(function (actionChoicerAnswers) {
            if (actionChoicerAnswers.action === 'build-from-template') {
                generator.templateChoicer(templates).then(function (templateChoicerAnswers) {
                    answers.template = templateChoicerAnswers.template;
                    inquirer.prompt([
                        {
                            type: 'text',
                            name: 'destPath',
                            message: 'Enter destination path:'
                        },
                        {
                            type: 'text',
                            name: 'inputDataFilename',
                            message: 'Enter json filename with input data or empty:',
                            default: 'empty'
                        },
                        {
                            type: 'confirm',
                            name: 'run',
                            message: 'Run build source from template?'
                        }
                    ]).then(function (destPathAnswers) {
                        answers.destPath = destPathAnswers.destPath;
                        if (answers.destPath) {
                            if (!utils.exists(answers.destPath)) {
                                answers.destPath = path.resolve(workPath, answers.destPath);
                            }
                        } else {
                            answers.destPath = path.resolve(workPath);
                        }
                        answers.inputDataFilename = destPathAnswers.inputDataFilename;
                        answers.run = destPathAnswers.run;
                        if (answers.run === true) {
                            console.log("Start build...");
                            var inputData = {};
                            if (typeof answers.inputDataFilename == 'object') {
                                inputData = answers.inputDataFilename;
                            }
                            if (answers.inputDataFilename && answers.inputDataFilename !== 'empty') {
                                if (!utils.exists(answers.inputDataFilename)) {
                                    answers.inputDataFilename = path.resolve(workPath, answers.inputDataFilename);
                                }
                                inputData = JSON.parse(utils.load(answers.inputDataFilename));
                            }
                            if (answers.template.data) {
                                inputData = _.merge(inputData, answers.template.data)
                            }
                            generator.buildTemplate(
                                answers.template.path,
                                answers.destPath,
                                inputData
                            ).then(function () {
                                console.log("End build...");
                            }).catch(function (error) {
                                console.error("Error in build", error);
                            });
                        }
                    });
                });
            }
            if (actionChoicerAnswers.action === 'create-template') {
                console.log("Start create template...");
                generator.buildTemplate(
                    path.resolve(__dirname, '../templates/create-template'),
                    templatesPath,
                    { srcgen: "srcgen" }
                ).then(function () {
                    console.log("End creating...");
                }).catch(function (error) {
                    console.error("Error in creating", error);
                });
            }
        });
    });
}
exports['default'] = generator;
module.exports = exports['default'];