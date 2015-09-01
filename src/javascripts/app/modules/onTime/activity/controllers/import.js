define(function(require) {
  'use strict';
  var angular = require('angular');
  var XLSX = require('xlsx'),
    moment = require('moment'),
    taskPriority = require('text!app/common/resources/taskSeverities.json');

  var controller = ['$scope', '$rootScope', '$modalInstance', 'toaster', 'parserFactory', 'activityFactory',
    function($scope, $rootScope, $modalInstance, toaster, parserFactory, activityFactory) {

      $scope.importModel = {
        file: null,
        fileName: '',
        results: [],
        table: {
          headers: [],
          rows: []
        }
      };

      $scope.isImporting = false;

      $scope.$watch('importModel.file', function(file) {
        console.log(file); // !file.$error
        if(file) {
          if(file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && file.type !== 'application/vnd.ms-excel') {
            toaster.pop('error', 'Error', 'Only accept .xlsx, .xls file');
          } else {
            $scope.progress($scope.importModel.file);
          }
        }
      });

      $scope.parseTable = function() {
        var records = $scope.importModel.results;
        // parse header
        var header = records[0];
        if(header) {
          $scope.importModel.table.headers = header;
          if(records.length > 1) {
            $scope.importModel.table.rows = records.splice(1);
          }
        }
        console.log($scope.importModel.table);
      };

      $scope.progress = function(f) {
        parserFactory.parseXls(f)
          .success(function(resp) {
            $scope.importModel.results = resp.records;
            $scope.importModel.fileName = resp.name;
            console.log(resp, $scope.importModel);
            $scope.parseTable();
          });
      };

      $scope.import = function() {
        $scope.isImporting = true;
        var priorities = angular.fromJson(taskPriority);
        var data = {
          "projectId": $rootScope.currentProjectInfo.projectId,
          "filename": $scope.importModel.fileName,
          "activityTaskRecords": []
        };
        _.each($scope.importModel.table.rows, function(el, idx) {
          data.activityTaskRecords.push({
            "index": idx,
            "activityCode": el[0],
            "activityName": el[1],
            "activityStartDate": el[2],
            "activityEndDate": el[3],
            "taskCode": el[4],
            "taskName": el[5],
            "taskStartDate": el[6],
            "taskEndDate": el[7],
            "estimatedCost": el[8],
            "actualCost": el[9],
            "percentageComplete": el[11],
            "priority": el[10]
            //"invalidMsg": null
          });
        });
        console.log(data, $scope.importModel);
        activityFactory.import(data)
          .success(function(resp) {
            console.log(resp);
          })
          .error(function(err) {
            console.log(err);
          });
      };

      //$modalInstance.close(data);
      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };
    }];
  return controller;
});