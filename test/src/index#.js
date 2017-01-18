var generator = require('../../index');
var path = require('path');
console.log(
    generator.builder.folder.all(
        path.resolve(__dirname),
        path.resolve(__dirname, '../dest'),
        { project: "3" },
        [__filename]
    )
);