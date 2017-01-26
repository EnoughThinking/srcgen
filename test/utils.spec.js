var should = require('chai').should(),
    generator = require('../index'),
    path = require('path'),
    fs = require('fs');
describe(`srcgen.utils.remove: remove file "fixtures/test.txt" if exists`, function () {
    it(`file "fixtures/test.txt" should be not exists`, function () {
        generator.utils.remove(path.resolve(__dirname, './fixtures/test.txt'));
        var result = generator.utils.exists(path.resolve(__dirname, './fixtures/test.txt'));
        result.should.equal(false);
    });
});
describe(`srcgen.utils.save: save to file "fixtures/test.txt"`, function () {
    it(`file "fixtures/test.txt" should be exists`, function () {
        generator.utils.save(path.resolve(__dirname, './fixtures/test.txt'), 'test');
        var result = generator.utils.exists(path.resolve(__dirname, './fixtures/test.txt'));
        result.should.equal(true);
    });
});
describe(`srcgen.utils.exists: check exists file "fixtures/test.txt"`, function () {
    it(`file "fixtures/test.txt" should be exists`, function () {
        var result = generator.utils.exists(path.resolve(__dirname, './fixtures/test.txt'));
        result.should.equal(true);
    });
});
describe(`srcgen.utils.load: load from file "fixtures/test.txt"`, function () {
    it(`file "fixtures/test.txt" content should be "test"`, function () {
        var result = generator.utils.load(path.resolve(__dirname, './fixtures/test.txt'));
        result.should.equal('test');
    });
});
describe(`srcgen.utils.copy: copy "fixtures/test.txt" file to "fixtures/copy-test.txt"`, function () {
    it(`file "fixtures/copy-test.txt" content should be "test"`, function () {
        generator.utils.remove(path.resolve(__dirname, './fixtures/copy-test.txt'));
        generator.utils.copy(path.resolve(__dirname, './fixtures/test.txt'), path.resolve(__dirname, './fixtures/copy-test.txt'));
        var result = generator.utils.load(path.resolve(__dirname, './fixtures/copy-test.txt'));
        result.should.equal('test');
    });
});