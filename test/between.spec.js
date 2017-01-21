var should = require('chai').should(),
    generator = require('../index'),
    fs = require('fs');
describe(`srcgen.beеween.get: get text from "text1 text2 text3" between "text1" and "text3"`, function () {
    it('should be " text2 "', function () {
        var result = generator.between.get('text1 text2 text3', 'text1', 'text3');
        result.length.should.equal(1);
        result[0].should.equal(' text2 ');
    });
});
describe(`srcgen.beеween.get: get text from "text1 text2 text3" between "text" and "text"`, function () {
    it('should be [\'1 \',\'2 \']', function () {
        var result = generator.between.get('text1 text2 text3', 'text', 'text');
        result.length.should.equal(2);
        result[0].should.equal('1 ');
        result[1].should.equal('2 ');
    });
});