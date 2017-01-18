'use strict';

exports.__esModule = true;
var utils = {};
utils.save = function (fileName, data) {
    var mkdirp = require('mkdirp');
    var path = require('path');
    var fs = require('fs');
    mkdirp.sync(path.dirname(fileName));
    fs.writeFileSync(fileName, data);
}
utils.load = function (fileName) {
    var path = require('path');
    var fs = require('fs');
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
}
utils.exists = function (fileName) {
    var path = require('path');
    var fs = require('fs');
    return fs.existsSync(fileName);
}
utils.copy = function (src, dest) {
    var fs = require('fs-extra');
    fs.copySync(src, dest);
}
exports['default'] = utils;
module.exports = exports['default'];