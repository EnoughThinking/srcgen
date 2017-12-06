'use strict';

exports.__esModule = true;

var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var fsExtra = require('fs-extra');

var utils = {};
utils.remove = function (fileName) {
    try {
        fileName = path.resolve(fileName);
        if (fs.existsSync(fileName)) {
            fs.unlinkSync(fileName);
        }
    } catch (error) {
        console.error(error);
    }
}
utils.save = function (fileName, data) {
    try {
        fileName = path.resolve(fileName);
        if (fs.existsSync(path.dirname(fileName))) {
            mkdirp.sync(path.dirname(fileName));
        } 
        fs.writeFileSync(fileName, data);
    } catch (error) {
        console.error(error);
    }
}
utils.load = function (fileName, defaultContent) {
    if (defaultContent === undefined) {
        defaultContent = null;
    }
    try {
        fileName = path.resolve(fileName);
        if (fs.existsSync(fileName)) {
            var content = fs.readFileSync(fileName).toString();
            // Cut BOM
            if (content.charCodeAt(0) === 0xFEFF) {
                content = content.slice(1);
            }
            return content;
        } else {
            return defaultContent;
        }
    } catch (error) {
        console.error(error);
    }
}
utils.exists = function (fileName) {
    if (fileName === true) {
        return false;
    }
    try {
        fileName = path.resolve(fileName);
        return fs.existsSync(fileName);
    } catch (error) {
        console.error(error);
    }
}
utils.copy = function (src, dest) {
    try {
        src = path.resolve(src);
        fsExtra.copySync(src, dest);
    } catch (error) {
        console.error(error);
    }
}
exports['default'] = utils;
module.exports = exports['default'];