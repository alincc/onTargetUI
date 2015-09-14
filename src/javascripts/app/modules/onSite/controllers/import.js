define(function(require) {
  'use strict';

  var controller = ['$scope', '$rootScope', '$modalInstance', 'toaster',
    function($scope, $rootScope, $modalInstance, toaster) {
      $scope.importModel = {
        file: null,
        headers: [],
        results: [],
        table: {
          headers: [],
          rows: []
        }
      };

      $scope.$watch('importModel.file', function(file) {
        console.log(file); // !file.$error
        if(file) {
          if(file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            toaster.pop('error', 'Error', 'Only accept .xlsx file');
          } else {
            $scope.progress($scope.importModel.file);
          }
        }
      });

      $scope.parseTable = function() {
        // parse header
        var firsObject = $scope.importModel.results[0];
        if(firsObject) {
          for(var prop in firsObject) {
            // important check that this is objects own property
            // not from prototype prop inherited
            if(firsObject.hasOwnProperty(prop)) {
              // prop: prop
              // value: firsObject[prop]
              $scope.importModel.headers.push(prop);
            }
          }
        }
      };

      //$modalInstance.close(data);
      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };
    }];
  return controller;
});