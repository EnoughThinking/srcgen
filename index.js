'use strict';
exports.__esModule = true;

var utils = require('./lib/utils');
var builder = require('./lib/builder');
var extractor = require('./lib/extractor');
var between = require('./lib/between');
var generator = require('./lib/generator');

var Generator = function (path) {
    if (path !== undefined) {

    }
};

Generator.prototype.utils = utils;
Generator.prototype.builder = builder;
Generator.prototype.extractor = extractor;
Generator.prototype.between = between;
Generator.prototype.generator = generator;

exports['default'] = new Generator();
exports['Generator'] = Generator;
module.exports = exports['default'];