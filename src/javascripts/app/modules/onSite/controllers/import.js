define(function(require) {
  'use strict';

  var XLSX = require('xlsx');

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
        //_.each($scope.results, function(el){
        //
        //});
      };

      $scope.progress = function(f) {
        var reader = new FileReader();
        var name = f.name;
        reader.onload = function(e) {
          var data = e.target.result;
          /* if binary string, read with type 'binary' */
          var workbook = XLSX.read(data, {type: 'binary'});

          var result = {};
          //workbook.SheetNames.forEach(function(sheetName) {
          //  var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
          //  if(roa.length > 0) {
          //    result[sheetName] = roa;
          //  }
          //});
          var first_sheet_name = workbook.SheetNames[0];
          var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[first_sheet_name]);
          $scope.importModel.results = roa;
          $scope.parseTable();
        };
        reader.readAsBinaryString(f);
      };

      //$modalInstance.close(data);
      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };
    }];
  return controller;
});