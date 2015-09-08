define(function(require) {
  'use strict';
  var angular = require('angular'),
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
            "taskDescription": el[5],
            "taskName": el[6],
            "taskStartDate": el[7],
            "taskEndDate": el[8],
            "estimatedCost": el[9],
            "actualCost": el[10],
            "percentageComplete": el[12],
            "priority": el[11]
            //"invalidMsg": null
          });
        });
        console.log(data, $scope.importModel);
        activityFactory.import(data)
          .success(function(resp) {
            console.log(resp);
            if(resp.invalidActivityRecords.length > 0) {
              var html = '';
              _.each(resp.invalidActivityRecords, function(el) {
                html += '- Row ' + el.index + ': ' + el.invalidMsg + '</br>';
              });
              toaster.pop({
                type: 'error',
                title: 'Error',
                body: html,
                bodyOutputType: 'trustedHtml'
              });
            }
            else {
              toaster.pop('success', 'Success', resp.returnMessage);
              $modalInstance.close({});
            }
            $scope.isImporting = false;
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