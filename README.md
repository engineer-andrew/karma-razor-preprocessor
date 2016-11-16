# karma-razor-preprocessor
A preprocessor for Karma that strips out Razor syntax from .cshtml files to allow integrated scripts to be tested.

## Installation
```
$ npm install karma-razor-preprocessor
```

## Purpose
The purpose of this preprocessor is to allow developers to test JavaScript code that is embedded within Razor files.  Although it is highly recommended to separate scripts into their own files (for reusability, caching, and performance reasons) sometimes you have to work with code that is what it is.  This preprocessor should help with that, at least a little bit.

## Configuration
The razorPreprocessor configuration block accepts only one object, named replacementDictionary.  The replacementDictionary object is an array of objects.  Each object in the array (that is, each replacement dictionary) **must** have a fileName property and a lookups property.  The fileName property should be the name of the file to match (the file name only, not the fully qualified path) and the lookups property should be an array.  Each item in the lookups array (that is, each lookup) **must** have a searchString property and a replacementString property.  These values are used to perform string replacement in the `<script>` blocks.

```
razorPreprocessor: Object
 replacementDictionary: Array
  fileName: String    
   lookups: Array    
    searchString: String      
    replacementString: String
```
```
// karma.config.js
module.exports = function(config) {
  config.set({
    preprocessors: {
      'Views/**/*.cshtml': ['razor']
    },

    files: [
      '*.js',
      'Views/**/*.cshtml'
    ],

    // if you have defined plugins explicitly, add karma-razor-preprocessor
    // plugins: [
    //     <your plugins>
    //     'karma-razor-preprocessor',
    // ],
    
    razorPreprocessor: {
      // define the replacements that should take place in specific files
      replacementDictionary: [
        {
          fileName: 'File1.cshtml', lookups: [
            { searchString: '@CustomHelper(Model)', replacementString: '{}' }
          ]
        },
        {
          fileName: 'File2.cshtml', lookups: [
            { searchString: '@CreateALink()', replacementString: '{}' }
          ]
        }
      ]
    },
  })
}
```

## How does it work?

This preprocessor strips all `<script>` blocks out of CSHTML (Razor) files and puts them in a separate file (in memory) for testing.  The preprocessor will also run string replacement in the stripped out `<script>` blocks to get rid of syntax errors when HTML helpers are used in the markup.

For instance this `File1.cshtml`:
```
@model Person
<html ng-app="demo">
  <head>*snip*</head>
  <body>
    <div>@ViewBag.TitleValue</div>
    <script>
      angular.module('demo', []).controller('demoController', ['$scope', function($scope) {
        $scope.model = @WriteJson(Model);
        
        $scope.buildName = function() {
          return $scope.model.firstName + ' ' + $scope.model.lastName;
        };
      }]);
    </script>
  </body>
</html>
```
will be converted to just this:
```
angular.module('demo', []).controller('demoController', ['$scope', function($scope) {
  $scope.model = {firstName: 'Mickey', lastName: 'Mouse'};
  
  $scope.buildName = function() {
    return $scope.model.firstName + ' ' + $scope.model.lastName;
  };
}]);
```
when this configuration is used:
```
razorPreprocessor: {
  // define the replacements that should take place in specific files
  replacementDictionary: [
    {
      fileName: 'File1.cshtml', lookups: [
        { searchString: '@WriteJson(Model)', replacementString: '{firstName: \'Mickey\', lastName: \'Mouse\'}' }
      ]
    }
  ]
},
```
