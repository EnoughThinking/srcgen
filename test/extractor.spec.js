var should = require('chai').should(),
    expect = require('chai').expect,
    generator = require('../index'),
    path = require('path'),
    fs = require('fs'),
    inquirer = require('inquirer');
var result, prompts;
describe(`srcgen.extractor.scan: extract prompts from file "fixtures/prompt-test.html"`, function () {
    it(`key "variables" should be exists`, function () {
        result = generator.extractor.scan(path.resolve(__dirname, './fixtures/prompt-test.html'), true);
        prompts = result.variables;
        expect(result).to.have.property('variables');
    });
    it(`key "STRVALUE" should be exists in variables`, function () {
        result = generator.extractor.scan(path.resolve(__dirname, './fixtures/prompt-test.html'), true);
        prompts = result.variables;
        expect(result.variables).to.have.property('STRVALUE');
    });
    it(`key "LISTVALUE" should be exists in variables`, function () {
        result = generator.extractor.scan(path.resolve(__dirname, './fixtures/prompt-test.html'), true);
        prompts = result.variables;
        expect(result.variables).to.have.property('LISTVALUE');
    });
    it(`check exists all prompts used in file`, function () {
        result = generator.extractor.scan(path.resolve(__dirname, './fixtures/prompt-test.html'), true);
        prompts = result.variables;
        expect(prompts).to.have.property('STRVALUE');
        expect(prompts).to.have.property('LISTVALUE');
        prompts.STRVALUE.length.should.equal(3);
        prompts.LISTVALUE.length.should.equal(1);
    });
    it(`should take a text prompt (primary)`, function () {
        result = generator.extractor.scan(path.resolve(__dirname, './fixtures/prompt-test.html'), true);
        prompts = result.variables;
        var promise = inquirer.prompt([prompts.STRVALUE[0]]);
        promise.ui.rl.emit('line');
        return promise.then(function (answers) {
            answers.STRVALUE.should.equal('test2');
        });
    });
    it(`should take a text prompt with message`, function () {
        result = generator.extractor.scan(path.resolve(__dirname, './fixtures/prompt-test.html'), true);
        prompts = result.variables;
        var promise = inquirer.prompt([prompts.STRVALUE[1]]);
        promise.ui.rl.emit('line');
        return promise.then(function (answers) {
            answers.STRVALUE.should.equal('test3');
        });
    });
    it(`should take a text prompt with message (last smalled)`, function () {
        result = generator.extractor.scan(path.resolve(__dirname, './fixtures/prompt-test.html'), true);
        prompts = result.variables;
        var promise = inquirer.prompt([prompts.STRVALUE[2]]);
        promise.ui.rl.emit('line');
        return promise.then(function (answers) {
            answers.STRVALUE.should.equal('test1');
        });
    });
    it(`should take a list prompt`, function () {
        result = generator.extractor.scan(path.resolve(__dirname, './fixtures/prompt-test.html'), true);
        prompts = result.variables;
        var promise = inquirer.prompt([prompts.LISTVALUE[0]]);
        promise.ui.rl.input.emit('keypress', null, { name: 'down' });
        promise.ui.rl.input.emit('keypress', null, { name: 'down' });
        promise.ui.rl.emit('line');
        return promise.then(function (answers) {
            answers.LISTVALUE.should.equal('Attack the wolf unarmed');
        });
    });
});
describe(`srcgen.extractor.folder.scan: extract prompts from folder "fixtures/src"`, function () {
    it(`key "variables" should be exists`, function () {
        result = generator.extractor.folder.scan(path.resolve(__dirname, './fixtures/src'), true);
        prompts = result.variables;
        expect(result).to.have.property('variables');
    });
    it(`key "STRVALUE" should be exists in variables`, function () {
        result = generator.extractor.folder.scan(path.resolve(__dirname, './fixtures/src'), true);
        prompts = result.variables;
        expect(result.variables).to.have.property('STRVALUE');
    });
    it(`should take a text prompt for many prompts with one name`, function () {
        result = generator.extractor.folder.scan(path.resolve(__dirname, './fixtures/src'), true);
        prompts = result.variables;
        var promise = inquirer.prompt([prompts.STRVALUE[0]]);
        promise.ui.rl.emit('line');
        return promise.then(function (answers) {
            prompts.STRVALUE[0].updater(answers.STRVALUE, prompts.STRVALUE[0]).should.equal('test1.2');
            prompts.STRVALUE[1].updater(answers.STRVALUE, prompts.STRVALUE[1], prompts.STRVALUE[0]).should.equal('Primary prefix test1.2 test2.2 Secondary prefix');
            prompts.STRVALUE[2].updater(answers.STRVALUE, prompts.STRVALUE[2], prompts.STRVALUE[0]).should.equal('test1.2');
            prompts.STRVALUE[3].updater(answers.STRVALUE, prompts.STRVALUE[3], prompts.STRVALUE[0]).should.equal('test1.2');
        });
    });
});