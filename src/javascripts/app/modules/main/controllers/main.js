define(function() {
  'use strict';
  var controller = ['$scope', '$rootScope', 'appConstant', function($scope, $rootScope, appConstant) {
    $scope.app = appConstant.app;
  }];
  return controller;
});