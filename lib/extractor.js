'use strict';

exports.__esModule = true;
var extractor = {};
extractor.variables = {};
extractor.values = {};
extractor.clear = function () {
    extractor.variables = {};
}
extractor._tag = 'prompt';
extractor.setTag = function (tag) {
    extractor._tag = tag;
};
extractor.evalJsInObjectItemValues = function (objects) {
    var maxAttributesLength = 0;
    var maxAttributesLengthObjectIndex = -1;
    Object.keys(objects).map(function (key, objectIndex) {
        var object = objects[key];
        if (Object.keys(object).length > maxAttributesLength) {
            maxAttributesLength = Object.keys(object).length;
            maxAttributesLengthObjectIndex = objectIndex;
        }
    });
    Object.keys(objects).map(function (key, objectIndex) {
        var object = objects[key];
        Object.keys(object).map(function (key, index) {
            if (object[key].indexOf('javascript:') === 0) {
                var code = object[key].substring('javascript:'.length);
                object[key] = new Function(`
                    var __max=${JSON.stringify(objects[maxAttributesLengthObjectIndex - 1])};
                    var __current=${JSON.stringify(object)};
                    return ${code};`)();
            }
        });
        objects[key] = object;
    });
    return objects;
};
extractor.scan = function (filepath) {
    var utils = require('./utils');
    var between = require('./between');
    let cheerio = require('cheerio')
    var content = utils.load(filepath);
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
    return {
        file: filepath,
        content: content,
        variables: objects
    };
}
extractor.folder = {};
extractor.folder.scan = function (srcFolderpath) {
    var recursive = require('recursive-readdir-synchronous');
    var inquirer = require('inquirer');
    extractor.clear();
    var files = recursive(srcFolderpath);
    files = files.map(function (file) {
        return extractor.scan(file);
    });
    files = files.filter(function (file) {
        return file !== null;
    });
    Object.keys(extractor.variables).map(function (key, index) {
        extractor.variables[key] = extractor.evalJsInObjectItemValues(extractor.variables[key]);
    });
    files = files.map(function (file) {
        Object.keys(file.variables).map(function (key, index) {
            if (extractor.variables[key] !== undefined) {
                file.variables[key] = extractor.variables[key];
            }
        });
        return file;
    });
    var promptsList = [];
    files.map(function (file, index) {
        Object.keys(file.variables).map(function (key, variableIndex) {
            var maxLength = 0;
            var maxIndex = 0;
            file.variables[key].map(function (variable, index) {
                if (Object.keys(file.variables[key][index]) > maxLength) {
                    maxIndex = index;
                }
            });
            var variable = file.variables[key][maxIndex];
            promptsList.push(variable);
        });
        return files;
    });
    inquirer.prompt(promptsList).then(function (results) {
        console.log(results);
    });
}
exports['default'] = extractor;
module.exports = exports['default'];