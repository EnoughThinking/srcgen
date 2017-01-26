'use strict';

exports.__esModule = true;
var utils = {};
utils.remove = function (fileName) {
    try {
        var path = require('path');
        var fs = require('fs');
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
        var mkdirp = require('mkdirp');
        var path = require('path');
        var fs = require('fs');
        fileName = path.resolve(fileName);
        mkdirp.sync(path.dirname(fileName));
        fs.writeFileSync(fileName, data);
    } catch (error) {
        console.error(error);
    }
}
utils.load = function (fileName) {
    try {
        var path = require('path');
        var fs = require('fs');
        fileName = path.resolve(fileName);
        if (fs.existsSync(fileName)) {
            var content = fs.readFileSync(fileName).toString();
            // Cut BOM
            if (content.charCodeAt(0) === 0xFEFF) {
                content = content.slice(1);
            }
            return content;
        } else {
            return null;
        }
    } catch (error) {
        console.error(error);
    }
}
utils.exists = function (fileName) {
    try {
        var path = require('path');
        var fs = require('fs');
        fileName = path.resolve(fileName);
        return fs.existsSync(fileName);
    } catch (error) {
        console.error(error);
    }
}
utils.copy = function (src, dest) {
    try {
        var path = require('path');
        var fs = require('fs-extra');
        src = path.resolve(src);
        fs.copySync(src, dest);
    } catch (error) {
        console.error(error);
    }
}
exports['default'] = utils;
module.exports = exports['default'];