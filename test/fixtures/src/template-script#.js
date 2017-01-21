var generator = require('../../../index');
var path = require('path');
/**
 * "data" include from parent script
 */
data.model.key3='val3';
var content = generator.builder.template(
    path.resolve(__dirname, './template-model!.js'),
    data
);
generator.utils.save(path.resolve(__destdir, './model.js'), content);
exports['default'] = content;
module.exports = exports['default'];