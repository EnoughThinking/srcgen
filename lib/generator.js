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
var CircularJSON = require("circular-json");

var generator = {};
generator.buildTemplate = function (srcPath, destPath, inputData, saveInputDataPath) {
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
                if (saveInputDataPath !== null) {
                    utils.save(saveInputDataPath, CircularJSON.stringify(promptedData.data, null, 4));
                }
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
generator.templateChoicer = function (templates, showTemplates, buildTemplate) {
    if (showTemplates === undefined) {
        showTemplates = null;
    }
    if (buildTemplate === undefined) {
        buildTemplate = null;
    }
    return new Promise(function (resolve, reject) {
        try {
            var choices = [];
            var founded = false;
            templates.map(function (template, index) {
                if (showTemplates === true) {
                    console.log(template.name);
                }
                if (!founded && template.name == buildTemplate) {
                    founded = template;
                }
                choices.push({
                    name: `${index + 1}) ${template.name} - ${template.description}`,
                    value: template
                });
            });
            if (showTemplates !== true) {
                if (founded === false) {
                    if (buildTemplate !== null) {
                        console.log(`Template "${buildTemplate}" not founded!`);
                    }
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
                } else {
                    resolve({ template: founded });
                }
            } else {
                resolve({ template: null });
            }
        } catch (error) {
            reject(error);
        }
    });
}
generator.actionChoicer = function (templates, showTemplates, buildTemplate) {
    if (buildTemplate === undefined) {
        buildTemplate = null;
    }
    return new Promise(function (resolve, reject) {
        if (buildTemplate !== null || showTemplates === true) {
            resolve({ action: 'build-from-template' });
            return;
        }
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
generator.runPrompts = function (destPath, inputDataFile, ignoreConfirm) {
    var prompts = [];
    var destPathAnswers = {};
    if (destPath === null) {
        prompts.push({
            type: 'text',
            name: 'destPath',
            message: 'Enter destination path:'
        });
    } else {
        if (destPath === '') {
            destPath = false;
        }
        destPathAnswers.destPath = destPath;
    }
    if (inputDataFile === null) {
        prompts.push({
            type: 'text',
            name: 'inputDataFilename',
            message: 'Enter json filename with input data or empty:',
            default: 'empty'
        });
    } else {
        if (inputDataFile === '') {
            inputDataFile = 'empty';
        }
        destPathAnswers.inputDataFile = inputDataFile;
    }
    if (ignoreConfirm === null) {
        prompts.push({
            type: 'confirm',
            name: 'run',
            message: 'Run build source from template?'
        });
    } else {
        destPathAnswers.run = true;
    }
    return new Promise(function (resolve, reject) {
        if (prompts.length > 0) {
            inquirer.prompt(prompts).then(function (data) {
                resolve(_.merge(destPathAnswers, data));
            });
        } else {
            resolve(destPathAnswers);
        }
    });
}
generator.run = function (workPath, showTemplates, buildTemplate,
    inputDataFile, inputData, destPath, ignoreConfirm, saveInputDataPath) {
    if (showTemplates === undefined) {
        showTemplates = null;
    }
    if (buildTemplate === undefined) {
        buildTemplate = null;
    }
    if (inputDataFile === undefined) {
        inputDataFile = null;
    }
    if (inputData === undefined) {
        inputData = null;
    }
    if (destPath === undefined) {
        destPath = null;
    }
    if (ignoreConfirm === undefined) {
        ignoreConfirm = null;
    }
    if (saveInputDataPath === undefined) {
        saveInputDataPath = null;
    }
    var answers = {};
    var templatesPath = "";
    workPath = path.resolve(workPath);
    templatesPath = path.resolve(workPath, './srcgen');
    generator.checkTemplatesPath(templatesPath).then(function (created) {
        if (created === false) {
            templatesPath = path.resolve(workPath);
        }
        var templates = generator.searchTemplates(templatesPath);
        generator.actionChoicer(templates, showTemplates, buildTemplate).then(function (actionChoicerAnswers) {
            if (actionChoicerAnswers.action === 'build-from-template') {
                generator.templateChoicer(templates, showTemplates, buildTemplate).then(function (templateChoicerAnswers) {
                    answers.template = templateChoicerAnswers.template;
                    if (answers.template === null) {
                        return;
                    }
                    generator.runPrompts(destPath, inputDataFile, ignoreConfirm)
                        .then(function (destPathAnswers) {
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
                                var inputDataLocal = {};
                                if (answers.inputDataFilename && answers.inputDataFilename !== 'empty') {
                                    if (!utils.exists(answers.inputDataFilename)) {
                                        answers.inputDataFilename = path.resolve(workPath, answers.inputDataFilename);
                                    }
                                    inputDataLocal = JSON.parse(utils.load(answers.inputDataFilename));
                                }
                                if (inputData !== null) {
                                    inputDataLocal = _.merge(inputDataLocal, JSON.parse(inputData));
                                }
                                if (answers.template.data) {
                                    inputDataLocal = _.merge(inputDataLocal, answers.template.data)
                                }
                                if (saveInputDataPath !== null) {
                                    if (saveInputDataPath) {
                                        if (!utils.exists(saveInputDataPath)) {
                                            saveInputDataPath = path.resolve(workPath, saveInputDataPath);
                                        }
                                    } else {
                                        saveInputDataPath = path.resolve(workPath, answers.template.name + '.json');
                                    }
                                }
                                generator.buildTemplate(
                                    answers.template.path,
                                    answers.destPath,
                                    inputDataLocal,
                                    saveInputDataPath
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