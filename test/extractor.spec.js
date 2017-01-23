var should = require('chai').should(),
    expect = require('chai').expect,
    generator = require('../index'),
    path = require('path'),
    fs = require('fs'),
    inquirer = require('inquirer');
var autosubmit = function (ui) {
    ui.process.subscribe(function () {
        // Use setTimeout because async properties on the following question object will still
        // be processed when we receive the subscribe event.
        setTimeout(function () {
            ui.rl.emit('line');
        }, 5);
    });
    ui.rl.emit('line');
};
var result, prompts;
describe(`srcgen.extractor.scan: extract prompts from file "fixtures/prompt-test.html"`, function () {
    beforeEach(function () {
        result = generator.extractor.scan(path.resolve(__dirname, './fixtures/prompt-test.html'));
        prompts = [];
        for (var key in result.variables) {
            var variables = generator.extractor.evalJsInObjectItemValues(result.variables[key]);
            for (var index in variables) {
                prompts.push(variables[index]);
            }
        }
    });
    it(`key "variables" should be exists`, function () {
        expect(result).to.have.property('variables');
    });
    it(`key "STRVALUE" should be exists in variables`, function () {
        expect(result.variables).to.have.property('STRVALUE');
    });
    it(`key "LISTVALUE" should be exists in variables`, function () {
        expect(result.variables).to.have.property('LISTVALUE');
    });
    it(`should take a text prompt`, function () {
        var promise = inquirer.prompt([prompts[0]]);
        promise.ui.rl.emit('line', 'demo');
        return promise.then(function (answers) {
            answers.STRVALUE.should.equal('demo');
        });
    });
    it(`should take a text prompt with message`, function () {
        var promise = inquirer.prompt([prompts[1]]);
        promise.ui.rl.emit('line', 'demo new');
        return promise.then(function (answers) {
            answers.STRVALUE.should.equal('demo new');
        });
    });
    it(`should take a list prompt`, function () {
        var promise = inquirer.prompt([prompts[2]]);
        promise.ui.rl.emit('keypress', null, { name: 'down' });
        promise.ui.rl.emit('keypress', null, { name: 'down' });
        promise.ui.rl.emit('line')
        return promise.then(function (answers) {
            answers.LISTVALUE.should.equal('Grab a large rock');
        });
    });
});