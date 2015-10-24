define(function(require){
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', '$q', '$location', 'appConstant', '$filter', '$window', '$state',
    function($scope, $rootScope, $q, $location, appConstant, $filter, $window, $state){
      $scope.app = appConstant.app;
    }
  ];
  
  return controller;
});