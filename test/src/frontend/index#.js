var generator = require('../../../index');
var path = require('path');
var content = generator.builder.template(
    path.resolve(__dirname, './index#.html'),
    { project: { pages: [{ name: 1, title: 2 }, { name: 3, title: 4 }] } }
);
generator.utils.save(path.resolve(__destdir, './index.html'), content);
exports['default'] = content;
module.exports = exports['default'];