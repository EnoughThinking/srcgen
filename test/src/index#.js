var generator = require('../../index');
var path = require('path');
console.log(
    /*generator.extractor.scan(path.resolve(__dirname, './index#.html'))*/
    /*generator.builder.folder.all(
        path.resolve(__dirname),
        path.resolve(__dirname, '../dest'),
        { project: "3" },
        [__filename]
    )*/
);
generator.extractor.folder.scan(path.resolve(__dirname));