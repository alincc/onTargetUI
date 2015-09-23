define(function() {
  'use strict';
  var controller = ['$scope', 'appConstant', '$location', '$state', 'permissionFactory', function($scope, appConstant, $location, $state, permissionFactory) {
    $scope.app = appConstant.app;
    $scope.$state = $state;
  }];
  return controller;
});