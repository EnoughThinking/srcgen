var generator = require(path.resolve(__dirname, '../../../index'));
/**
 * "data" include from parent script
 */
model.key3 = 'val3';
var content = generator.builder.template(
    path.resolve(__dirname, './template-model!.js'),
    { model: model }
);
generator.utils.save(path.resolve(__destdir, './model.js'), content);