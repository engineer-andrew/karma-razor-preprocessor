function buildNewContents(content, lastEndIndex) {
    var startIndex = content.indexOf('<script>', lastEndIndex);
    var result = {};

    if (startIndex > -1) {
        var endIndex = content.indexOf('</script>', startIndex);

        var script = content.substring(startIndex + 8, endIndex);
        var remaining = content.substring(endIndex);

        result =  {
            endIndex: endIndex,
            remaining: remaining,
            script: script,
        };
    } else {
        result.remaining = ''
    }

    return result;
};

var createRazorPreprocessor = function(config) {
    config = typeof config === 'object' ? config : {};

    var transformPath = config.transformPath || function(filePath) {
        return filePath.replace(/\.cshtml$/, '.js');
    };

    return function(content, file, done) {
        file.path = transformPath(file.originalPath);
        
        var newContent = '';
        var endIndex = 0;
        var contents = content;
        var counter = 0;
        while (true){
            var result = buildNewContents(contents, endIndex);

            endIndex = result.endIndex;
            contents = result.remaining;
            counter++;

            if (counter > 10){
                throw 'There are more than 10 embedded script statements in the file!'
            }

            if (result.remaining.length === 0) {
                break;
            } else {
                newContent += result.script;
            }
        }

        if (!!config && !!config.replacementDictionary && !!config.replacementDictionary.length) {
            for (var i = config.replacementDictionary.length; --i >= 0;) {
                newContent = newContent.replace(config.replacementDictionary[i].searchString, config.replacementDictionary[i].replacementString);
            }
        }

        done(newContent);
    };
};

createRazorPreprocessor.$inject = ['config.razorPreprocessor'];

module.exports = {
    'preprocessor:razor': ['factory', createRazorPreprocessor]
}