'use strict';

exports.__esModule = true;
var _ = require('lodash');
var builder = {};
builder._delimiters = ['<%', '%>'];
builder.setDelimiter = function (startTag, endTag) {
    _.templateSettings = {
        evaluate: new RegExp(`${startTag}(.+?)${endTag}`, 'g'),
        interpolate: new RegExp(`${startTag}=(.+?)${endTag}`, 'g'),
        escape: new RegExp(`${startTag}-(.+?)${endTag}`, 'g')
    };
    builder._delimiters = [startTag, endTag]
};
builder.setDelimiter(builder._delimiters[0], builder._delimiters[1]);
builder.filename = function (str, data) {
    var temp = _.templateSettings.interpolate;
    _.templateSettings.interpolate = new RegExp(`%(.+?)%`, 'g');
    str = str.replace(`\\${builder._delimiters[0]}`, `TEMP#STRING${builder._delimiters[0]}`);
    var compiled = _.template(str);
    var result = compiled(data).replace('TEMP#STRING', '\\');
    _.templateSettings.interpolate = temp;
    return result;
}
builder.string = function (str, data) {
    var compiled = _.template(str);
    return compiled(data);
}
builder.template = function (templateFileName, data) {
    var utils = require('./utils');
    var content = utils.load(templateFileName);
    if (content === null) {
        return null;
    }
    var compiled = _.template(content);
    return compiled(data);
}
builder.script = function (filepath, srcFolderpath, destFolderpath, data) {
    var utils = require('./utils');
    var vm = require("vm");
    var path = require("path");
    var Module = require("module").Module;
    if (filepath.indexOf('#.js') === -1) {
        filepath = filepath + '#.js';
    }
    var code = utils.load(filepath);
    if (code === null)
        return null;
    var filepath = path.resolve(process.cwd(), filepath);
    var filename = path.basename(filepath);
    var dirname = path.dirname(filepath);
    var cachedModule = Module._cache[filepath];
    var mod = new Module(filepath, module);
    Module._cache[filepath] = mod;
    mod.filename = filepath;
    mod.paths = Module._nodeModulePaths(dirname);
    mod.paths.push(dirname);
    var _srcFolderpath = path.resolve(srcFolderpath);
    var _destFolderpath = path.resolve(destFolderpath);
    mod._compile(`
        var data=${JSON.stringify(data)};
        var __srcdir=${JSON.stringify(_srcFolderpath)};
        var __destdir=${JSON.stringify(_destFolderpath)};
        ${code}`, filepath);
    mod.loaded = true;
    return mod.exports;
}
builder.folder = {};
builder.folder.copySrcToDest = function (srcFolderpath, destFolderpath, data) {
    var utils = require('./utils');
    var path = require("path");
    var recursive = require('recursive-readdir-synchronous');
    var replaceExt = require('replace-ext');
    var mkdirp = require('mkdirp');
    function ignoreFunc(file, stats) {
        return replaceExt(file, '.custom').indexOf('#.custom') !== -1 || replaceExt(file, '.custom').indexOf('!.custom') !== -1;
    }
    var files = recursive(srcFolderpath, [ignoreFunc]);
    files = files.map(function (file) {
        var utils = require('./utils');
        var newFile = builder.filename(path.resolve(file.replace(srcFolderpath, destFolderpath)), data);
        mkdirp.sync(path.dirname(newFile));
        var content = builder.template(file, data);
        utils.save(newFile, content);
        return newFile;
    });
    return files;
}
builder.folder.runScriptsInSrc = function (srcFolderpath, destFolderpath, data, ignoreFiles) {
    var utils = require('./utils');
    var path = require("path");
    var recursive = require('recursive-readdir-synchronous');
    var replaceExt = require('replace-ext');
    var mkdirp = require('mkdirp');
    if (ignoreFiles === undefined) {
        ignoreFiles = [];
    }
    function ignoreFunc(file, stats) {
        return (!stats.isDirectory() && file.indexOf('#.js') === -1) || ignoreFiles.indexOf(file) !== -1;
    }
    var files = recursive(srcFolderpath, [ignoreFunc]);
    files = files.map(function (file) {
        builder.script(file, srcFolderpath, destFolderpath, data);
        return file;
    });
    return files;
}
builder.folder.all = function (srcFolderpath, destFolderpath, data, ignoreFiles) {
    return [
        builder.folder.copySrcToDest(
            srcFolderpath,
            destFolderpath,
            data
        ),
        builder.folder.runScriptsInSrc(
            srcFolderpath,
            destFolderpath,
            data,
            ignoreFiles
        )
    ];
}
exports['default'] = builder;
module.exports = exports['default'];