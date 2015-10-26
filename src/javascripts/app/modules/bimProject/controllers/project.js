define(function(require){
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', '$q', '$location', 'appConstant', '$stateParams',
    function($scope, $rootScope, $q, $location, appConstant, $stateParams){
      $scope.app = appConstant.app;
      $scope.constant = appConstant;
      $scope.projectBimFileId = $stateParams.projectBimFileId;

      //var project = new bimProjectFactory.Project($('.maincontainer'), bimProjectFactory.main, $stateParams.poid);
    }
  ];

  return controller;
});