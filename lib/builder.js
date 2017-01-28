'use strict';

exports.__esModule = true;
var recursive = require('recursive-readdir-synchronous');
var replaceExt = require('replace-ext');
var mkdirp = require('mkdirp');
var _ = require('lodash');
var utils = require('./utils');
var path = require("path");
var vm = require("vm");
var Module = require("module").Module;

var builder = {};
builder._delimiters = ['<%', '%>'];
builder._replacers = [];//[{from:'fromText',to:'toText'}]
builder.setDelimiter = function (startTag, endTag) {
    try {
        _.templateSettings = {
            evaluate: new RegExp(`${startTag}(.+?)${endTag}`, 'g'),
            interpolate: new RegExp(`${startTag}=(.+?)${endTag}`, 'g'),
            escape: new RegExp(`${startTag}-(.+?)${endTag}`, 'g')
        };
        builder._delimiters = [startTag, endTag];
    } catch (error) {
        console.error(error);
    }
};
builder.setReplacers = function (replacers) {
    builder._replacers = replacers;
};
builder.setDelimiter(builder._delimiters[0], builder._delimiters[1]);
builder.load = function (fileName) {
    try {
        var content = utils.load(fileName);
        builder._replacers.map(function (item) {
            //console.log(fileName, content.indexOf(item.from), item.from, item.to);
            content = content.replace(new RegExp(item.from.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'ig'), item.to);
        });
        return content;
    } catch (error) {
        console.error(error);
    }
}
builder.filename = function (str, data) {
    try {
        var temp = _.templateSettings.interpolate;
        _.templateSettings.interpolate = new RegExp(`%(.+?)%`, 'g');
        str = str.replace(`\\${builder._delimiters[0]}`, `TEMP#STRING${builder._delimiters[0]}`);
        var compiled = _.template(str);
        var result = compiled(data).replace('TEMP#STRING', '\\');
        _.templateSettings.interpolate = temp;
        return result;
    } catch (error) {
        console.error(error);
    }
}
builder.string = function (str, data) {
    var compiled = _.template(str);
    return compiled(data);
}
builder.template = function (templateFileName, data) {
    var content = builder.load(templateFileName);
    try {
        if (content === null) {
            return null;
        }
        var compiled = _.template(content);
        return compiled(data);
    } catch (error) {
        console.error(error, content);
    }
}
builder.script = function (filepath, srcFolderpath, destFolderpath, data) {
    try {
        if (filepath.indexOf('#.js') === -1) {
            filepath = filepath + '#.js';
        }
        var code = builder.load(filepath);
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
    } catch (error) {
        console.error(error);
    }
}
builder.folder = {};
builder.folder.copySrcToDest = function (srcFolderpath, destFolderpath, data) {
    try {
        function ignoreFunc(file, stats) {
            return replaceExt(file, '.custom').indexOf('#.custom') !== -1 || replaceExt(file, '.custom').indexOf('!.custom') !== -1 || path.basename(file) === 'srcgen.conf.json';
        }
        var files = recursive(srcFolderpath, [ignoreFunc]);
        files = files.map(function (file) {
            var newFile = builder.filename(path.resolve(file.replace(srcFolderpath, destFolderpath)), data);
            mkdirp.sync(path.dirname(newFile));
            var content = builder.template(file, data);
            utils.save(newFile, content);
            return newFile;
        });
        return files;
    } catch (error) {
        console.error(error);
    }
}
builder.folder.runScriptsInSrc = function (srcFolderpath, destFolderpath, data, ignoreFiles) {
    try {
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
    } catch (error) {
        console.error(error);
    }
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