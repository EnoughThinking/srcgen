var generator = require('../../index');
var path = require('path');
var result =
    /*generator.extractor.scan(path.resolve(__dirname, './index#.html'));
    */
    console.log(
        /*
        generator.builder.template(
            path.resolve(__dirname, './frontend/index#.html'),
            { project: { pages: [{ name: 1, title: 2 }, { name: 3, title: 4 }] } }
        )*/
        //1//result
        /*generator.extractor.scan(path.resolve(__dirname, './index#.html'))
        /*generator.builder.folder.all(
                path.resolve(__dirname),
                path.resolve(__dirname, '../dest'),
                { project: "3" },
                [__filename]
            )*/
    );
generator.extractor.folder.prompt(path.resolve(__dirname, '../fixtures/src')).then(function (data) {
    console.log(data.data, 1, data.variables.STRVALUE[1]);
});