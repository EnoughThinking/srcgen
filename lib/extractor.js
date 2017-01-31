'use strict';

exports.__esModule = true;

var utils = require('./utils');
var between = require('./between');
var cheerio = require('cheerio');
var _ = require('lodash');
var inquirer = require('inquirer');
var recursive = require('recursive-readdir-synchronous');
var objectPath = require("object-path");
var path = require("path");

var extractor = {};
extractor._inquirer = inquirer;
extractor.variables = {};
extractor.values = {};
extractor.clear = function () {
    extractor.variables = {};
}
extractor._tag = 'prompt';
extractor.setTag = function (tag) {
    extractor._tag = tag;
};
extractor.prepareVariable = function (objects) {
    try {
        objects = objects.sort(function (a, b) {
            if (a['attrCount'] < b['attrCount']) {
                return 1;
            }
            if (a['attrCount'] > b['attrCount']) {
                return -1;
            }
            return 0;
        });
        Object.keys(objects).map(function (key, objectIndex) {
            var object = objects[key];
            var maxObject = {};
            if (objectIndex > 0) {
                maxObject = object;
            }
            if (object['updater'] === undefined) {
                object['updater'] = "javascript:return __value";
            }
            Object.keys(object).map(function (key, index) {
                if (object[key] !== undefined && typeof object[key] == 'string') {
                    if (object[key].toLowerCase() === 'false') {
                        object[key] = false;
                    } else {
                        if (object[key].toLowerCase() === 'true') {
                            object[key] = true;
                        } else {
                            if (object[key].indexOf('javascript:') === 0) {
                                var code = object[key].substring('javascript:'.length);
                                try {
                                    if (code.indexOf('arguments') != -1 || code.indexOf('__value') != -1 || code.indexOf('__current') != -1 || code.indexOf('__max') != -1) {
                                        var code = `
                                    var __value = arguments.length > 0 ? arguments[0] : null;
                                    var __current = arguments.length > 1 ? arguments[1] : {};
                                    var __max = arguments.length > 2 ? arguments[2] : {};
                                    var _ = arguments.length > 3 ? arguments[3] : null;
                                    var inquirer = arguments.length > 4 ? arguments[4] : null;
                                    var path = arguments.length > 5 ? arguments[5] : null;
                                    var utils = arguments.length > 6 ? arguments[6] : null;
                                    var objectPath = arguments.length > 7 ? arguments[7] : null;
                                    ${code};`;
                                        object[key] = new Function(code);
                                    } else {
                                        object[key] = new Function(code)();
                                    }
                                } catch (err) {
                                    console.error(key, code);
                                }
                            }
                        }
                    }
                }
            });
            objects[key] = object;
        });
        return objects;
    } catch (error) {
        console.error(error);
    }
};
extractor.scan = function (filepath, prepareVariable) {
    try {
        var content = utils.load(filepath);
        if (prepareVariable === undefined) {
            prepareVariable = false;
        }
        if (content === null) {
            return null;
        }
        var items = between.get(content, `<${extractor._tag}`, `</${extractor._tag}>`);
        if (items.length === 0)
            return null;
        var objects = {};
        items.map(function (item) {
            var $ = cheerio.load(`<${extractor._tag}${item}</${extractor._tag}>`);
            var name = $(`${extractor._tag}`).attr('name');
            var object = $(`${extractor._tag}`).attr();
            object['attrCount'] = Object.keys(object).length;
            object.outer = `<${extractor._tag}${item}</${extractor._tag}>`;
            object.inner = $(`${extractor._tag}`).html();
            if (object['type'] === undefined) {
                object['type'] = 'text';
            }
            if (object['message'] === undefined) {
                object['message'] = name;
            }
            if (object['default'] === undefined) {
                object['default'] = object.inner;
            }
            if (objects[name] === undefined) {
                objects[name] = [];
            }
            if (extractor.variables[name] === undefined) {
                extractor.variables[name] = [];
            }
            objects[name].push(object);
            extractor.variables[name].push(object);
        });
        if (prepareVariable === true) {
            for (var key in objects) {
                objects[key] = extractor.prepareVariable(objects[key]);
            }
        }
        return {
            file: filepath,
            content: content,
            variables: objects
        };
    } catch (error) {
        console.error(error);
    }
}
extractor.folder = {};
extractor.folder.scan = function (srcFolderpath, prepareVariable) {
    try {
        if (prepareVariable === undefined) {
            prepareVariable = false;
        }
        extractor.clear();
        var files = recursive(srcFolderpath);
        files = files.map(function (file) {
            return extractor.scan(file);
        });
        files = files.filter(function (file) {
            return file !== null;
        });
        var variables = {};
        files.map(function (file, index) {
            Object.keys(file.variables).map(function (key, variableIndex) {
                if (variables[key] === undefined) {
                    variables[key] = [];
                }
                variables[key] = variables[key].concat(file.variables[key]);
            });
            return files;
        });
        if (prepareVariable === true) {
            for (var key in variables) {
                variables[key] = extractor.prepareVariable(variables[key]);
            }
        }
        return {
            files: files,
            variables: variables
        };
    } catch (error) {
        console.error(error);
    }
}
extractor.folder._updateVariablesByAnswers = function (variables, answers, data) {
    try {
        for (var key in variables) {
            if (objectPath.get(data, key) === undefined) {
                for (var i = 0; i < variables[key].length; i++) {
                    var maxVariable = i == 0 ? null : variables[key][0];
                    variables[key][i].inner = variables[key][i].updater(
                        objectPath.get(answers, key),
                        variables[key][i],
                        maxVariable,
                        _,
                        inquirer,
                        path,
                        utils,
                        objectPath
                    );
                }
            } else {
                for (var i = 0; i < variables[key].length; i++) {
                    var maxVariable = i == 0 ? null : variables[key][0];
                    variables[key][i].inner = variables[key][i].updater(
                        objectPath.get(data, key),
                        variables[key][i],
                        maxVariable,
                        _,
                        inquirer,
                        path,
                        utils,
                        objectPath
                    );
                }
            }
            if (objectPath.get(answers, key) !== undefined) {
                objectPath.set(data, key, objectPath.get(answers, key));
            }
        }
        return {
            variables: variables,
            data: data
        };
    } catch (error) {
        console.error(error);
    }
}
extractor.folder.prompt = function (srcFolderpath, data) {
    if (!data) {
        data = {};
    }
    return new Promise(function (resolve, reject) {
        try {
            var result = extractor.folder.scan(path.resolve(srcFolderpath), true);
            var prompts = [];
            for (var key in result.variables) {
                if (objectPath.get(data, key) === undefined) {
                    prompts.push(result.variables[key][0]);
                }
            }
            extractor._inquirer.prompt(prompts).then(function (answers) {
                var updated = extractor.folder._updateVariablesByAnswers(result.variables, answers, data);
                result.variables = updated.variables;
                result.data = updated.data;
                resolve(result);
            });
        } catch (err) {
            reject(err);
        }
    });
};
exports['default'] = extractor;
module.exports = exports['default'];