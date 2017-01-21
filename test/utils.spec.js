var should = require('chai').should(),
    generator = require('../index'),
    path = require('path'),
    fs = require('fs');
describe(`srcgen.utils.remove: remove file "fixtures/test.txt" if exists`, function () {
    it(`file "fixtures/test.txt" should be not exists`, function () {
        generator.utils.remove('fixtures/test.txt');
        var result = generator.utils.exists('fixtures/test.txt');
        result.should.equal(false);
    });
});
describe(`srcgen.utils.save: save to file "fixtures/test.txt"`, function () {
    it(`file "fixtures/test.txt" should be exists`, function () {
        generator.utils.save('fixtures/test.txt', 'test');
        var result = generator.utils.exists('fixtures/test.txt');
        result.should.equal(true);
    });
});
describe(`srcgen.utils.exists: check exists file "fixtures/test.txt"`, function () {
    it(`file "fixtures/test.txt" should be exists`, function () {
        var result = generator.utils.exists('fixtures/test.txt');
        result.should.equal(true);
    });
});
describe(`srcgen.utils.load: load from file "fixtures/test.txt"`, function () {
    it(`file "fixtures/test.txt" content should be "test"`, function () {
        var result = generator.utils.load('fixtures/test.txt');
        result.should.equal('test');
    });
});
describe(`srcgen.utils.copy: copy "fixtures/test.txt" file to "fixtures/copy-test.txt"`, function () {
    it(`file "fixtures/copy-test.txt" content should be "test"`, function () {
        generator.utils.remove('fixtures/copy-test.txt');
        generator.utils.copy('fixtures/test.txt', 'fixtures/copy-test.txt');
        var result = generator.utils.load('fixtures/copy-test.txt');
        result.should.equal('test');
    });
});