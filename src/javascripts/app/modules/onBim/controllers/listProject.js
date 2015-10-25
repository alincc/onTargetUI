define(function(require){
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', '$q', '$location', 'appConstant', '$filter', '$window', '$state', 'onBimFactory',
    function($scope, $rootScope, $q, $location, appConstant, $filter, $window, $state, onBimFactory){
      $scope.app = appConstant.app;
      
      $scope.getProjectList = function() {
        onBimFactory.getAllProjects($rootScope.currentProjectInfo.projectId).success(
          function(resp) {
            $scope.projectList = resp.poids;
          }
        );

        /*onBimFactory.getBimProjectList().success(
          function (resp){
            console.log(resp);
            $scope.projectList = resp.response.result;
          }
        );*/
      };
      
      $scope.projectDetail = function (project){
        
      };
      
      $scope.getProjectList();
    }
  ];
  
  return controller;
});