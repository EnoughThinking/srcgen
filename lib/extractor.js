'use strict';

exports.__esModule = true;
var extractor = {};
extractor.variables = {};
extractor.clear = function () {
    extractor.variables = {};
}
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
                    var __max=${JSON.stringify(objects[maxAttributesLengthObjectIndex])};
                    var __current=${JSON.stringify(object)};
                    return ${code};`)();
            }
        });
        objects[key] = object;
    });
    return objects;
};
extractor.scanFile = function (filepath) {
    var utils = require('./utils');
    var between = require('./between');
    let cheerio = require('cheerio')
    var content = utils.load(filepath);
    if (content === null) {
        return null;
    }
    var items = between.get(content, '<prompt', '</prompt>');
    if (items.length === 0)
        return null;
    var objects = {};
    items.map(function (item) {
        var $ = cheerio.load(`<prompt${item}</prompt>`);
        var name = $('prompt').attr('name');
        var object = $('prompt').attr();
        object.outer = `<prompt${item}</prompt>`;
        object.inner = $('prompt').html();
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
extractor.scan = function (srcFolderpath) {
    var recursive = require('recursive-readdir-synchronous');
    extractor.clear();
    var files = recursive(srcFolderpath);
    files = files.map(function (file) {
        return extractor.scanFile(file);
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
    return files;
}
exports['default'] = extractor;
module.exports = exports['default'];