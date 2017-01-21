var should = require('chai').should(),
    generator = require('../index'),
    path = require('path'),
    fs = require('fs');
describe(`srcgen.builder.filename: transform filename "fixtures/%object.field1%"`, function () {
    it(`should be "fixtures/file1.txt"`, function () {
        var result = generator.builder.filename(
            'fixtures/%object.field1%',
            { object: { field1: "file1.txt" } }
        );
        result.should.equal('fixtures/file1.txt');
    });
});
describe(`srcgen.builder.string: transform string "12_<%=object.value%>_34"`, function () {
    it(`should be "12_56_34"`, function () {
        var result = generator.builder.string(
            '12_<%=object.value%>_34',
            { object: { value: '56' } }
        );
        result.should.equal('12_56_34');
    });
});
describe(`srcgen.builder.template: transform content in template file "fixtures/template-test.html"`, function () {
    it(`should be "<html><title>Page Title</title></html>"`, function () {
        var result = generator.builder.template(
            path.resolve(__dirname, './fixtures/template-test.html'),
            { page: { title: 'Page Title' } }
        );
        result.should.equal('<html><title>Page Title</title></html>');
    });
});
describe(`srcgen.builder.script: run script "fixtures/src/template-script#.js" for generate file content by template file "fixtures/dest/template-model!.js"`, function () {
    it(`should be "var model={key1:"val1",key2:"val2",key3:"val3",};"`, function () {
        generator.utils.remove(path.resolve(__dirname, './fixtures/dest/model.js'));
        generator.builder.script(
            path.resolve(__dirname, './fixtures/src/template-script#.js'),
            path.resolve(__dirname, './fixtures/src'),
            path.resolve(__dirname, './fixtures/dest'),
            { model: { key1: 'val1', key2: 'val2' } }
        );
        var result = generator.utils.load(path.resolve(__dirname, './fixtures/dest/model.js'));
        result.should.equal('var model={key1:"val1",key2:"val2",key3:"val3",};');
    });
});
describe(`srcgen.builder.folder.copySrcToDest: copy and transform files from src folder "fixtures/src" to dest folder "fixtures/dest"`, function () {
    it(`file "fixtures/dest/Post.py" should be exists`, function () {
        generator.utils.remove(path.resolve(__dirname, './fixtures/dest/Post.py'));
        generator.builder.folder.copySrcToDest(
            path.resolve(__dirname, './fixtures/src'),
            path.resolve(__dirname, './fixtures/dest'),
            { ModelName: 'Post' }
        );
        var result = generator.utils.exists(path.resolve(__dirname, './fixtures/dest/Post.py'));
        result.should.equal(true);
    });
    it(`file "fixtures/dest/Post.py" should be containt "Post"`, function () {
        var result = generator.utils.load(path.resolve(__dirname, './fixtures/dest/Post.py'));
        (result.indexOf('Post') !== -1).should.equal(true);
    });
});
describe(`srcgen.builder.folder.runScriptsInSrc: run all script in folder "fixtures/src"`, function () {
    it(`should be "var model={key1:"val1",key2:"val2",key3:"val3",};"`, function () {
        generator.utils.remove(path.resolve(__dirname, './fixtures/dest/model.js'));
        generator.builder.folder.runScriptsInSrc(
            path.resolve(__dirname, './fixtures/src'),
            path.resolve(__dirname, './fixtures/dest'),
            { model: { key1: 'val1', key2: 'val2' } }
        );
        var result = generator.utils.load(path.resolve(__dirname, './fixtures/dest/model.js'));
        result.should.equal('var model={key1:"val1",key2:"val2",key3:"val3",};');
    });
});
describe(`srcgen.builder.folder.all: run all script and transform templates in folder "fixtures/src"`, function () {
    it(`files should be not exists "fixtures/dest/model.js" and "fixtures/dest/Post.py"`, function () {
        generator.utils.remove(path.resolve(__dirname, './fixtures/dest/model.js'));
        generator.utils.remove(path.resolve(__dirname, './fixtures/dest/Post.py'));
        var result;
        result = generator.utils.exists(path.resolve(__dirname, './fixtures/dest/model.js'));
        result.should.equal(false);
        result = generator.utils.exists(path.resolve(__dirname, './fixtures/dest/Post.py'));
        result.should.equal(false);
    });
    it(`files should be exists "fixtures/dest/model.js" and "fixtures/dest/Post.py"`, function () {
        generator.builder.folder.all(
            path.resolve(__dirname, './fixtures/src'),
            path.resolve(__dirname, './fixtures/dest'),
            { ModelName: 'Post', model: { key1: 'val1', key2: 'val2' } }
        );
        var result;
        result = generator.utils.exists(path.resolve(__dirname, './fixtures/dest/model.js'));
        result.should.equal(true);
        result = generator.utils.exists(path.resolve(__dirname, './fixtures/dest/Post.py'));
        result.should.equal(true);
    });
});