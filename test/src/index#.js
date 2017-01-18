var generator = require('../../index');
var path = require('path');
console.log(
    /*generator.extractor.scanFile(path.resolve(__dirname, './index#.html'))*/
    generator.extractor.scan(path.resolve(__dirname))
    /*generator.builder.folder.all(
        path.resolve(__dirname),
        path.resolve(__dirname, '../dest'),
        { project: "3" },
        [__filename]
    )*/
);