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

String.prototype.endsWith = function(searchString) {
  return this.substr(-1 * (searchString.length)) === searchString;
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

        var fileName = file.originalPath.substring(file.originalPath.lastIndexOf('/') + 1);

        if (!!config && !!config.replacementDictionary && !!config.replacementDictionary.length) {
            var match = config.replacementDictionary.filter(function(dictionary) {
                return dictionary.fileName === fileName;
            });

            for (var i = match.length; --i >= 0;) {
                for (var j = match[i].lookups.length; --j >= 0;) {
                    newContent = newContent.replace(match[i].lookups[j].searchString, match[i].lookups[j].replacementString);
                }
            }
        }

        done(newContent);
    };
};

createRazorPreprocessor.$inject = ['config.razorPreprocessor'];

module.exports = {
    'preprocessor:razor': ['factory', createRazorPreprocessor]
}