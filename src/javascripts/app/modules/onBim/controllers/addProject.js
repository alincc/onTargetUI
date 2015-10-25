define(function(require){
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', '$q', '$location', 'appConstant', '$filter', '$window', '$state', 'onBimFactory',
    function($scope, $rootScope, $q, $location, appConstant, $filter, $window, $state, onBimFactory){
      $scope.app = appConstant.app;
      $scope.project = {};
      $scope.updateData = {};
      $scope.oid = '';
      var load = function (){
        $scope.uniformLengthMeasure = onBimFactory.getUniformLengthMeasure();
        $scope.schema = onBimFactory.getSchema();
      };

      $scope.addBimProject = function (){
        onBimFactory.addBimProject($scope.project.projectName, $scope.project.schema)
          .success(function (resp){
            var updateData = resp.response.result;
            $scope.oid = updateData.oid;
            updateData.description = $scope.project.description;
            updateData.exportLengthMeasurePrefix = $scope.project.exportLengthMeasurePrefix;
            onBimFactory.updateBimProject(updateData).success(
              function (resp){
                onBimFactory.addProject($rootScope.currentProjectInfo.projectId, $scope.oid, '').success(function (resp){
                  $scope._form.$setPristine();
                  $state.go('app.onBim.listProject');
                });
              }
            );
          }
        );
      };

      load();
    }
  ];
  return controller;
});