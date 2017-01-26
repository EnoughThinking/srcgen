#!/usr/bin/env node
var generator = require('../index');
var path = require('path');
var srcPath = path.resolve(__dirname, '../test/fixtures/src');
var destPath = path.resolve(__dirname, '../test/fixtures/dest');
var inputData = { STRVALUE2: '1', ModelName: 'Post', model: { key1: 'val1', key2: 'val2' }, 'replace me': 'replaced text' };
generator.extractor.folder.prompt(srcPath, inputData).then(function (promptedData) {
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
                replacers.push({ from: obj.name, to: obj.inner });
            });
        });
        generator.builder.setReplacers(replacers);
        generator.builder.folder.all(
            srcPath,
            destPath,
            promptedData.data
        );
        Object.keys(promptedData.data).map(function (key) {
            if (typeof promptedData.data[key] !== 'object' && !Array.isArray(promptedData.data[key])) {
                replacers.push({ from: key, to: promptedData.data[key] });
            }
        });
        generator.builder.folder.all(
            destPath,
            destPath,
            promptedData.data
        );
    } catch (error) {
        console.error(error);
    }
}, function (error) {
    console.log(error);
});