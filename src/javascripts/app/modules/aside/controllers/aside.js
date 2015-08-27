define(function() {
  'use strict';
  var controller = ['$scope', 'appConstant', '$location', '$state', 'permissionFactory', function($scope, appConstant, $location, $state, permissionFactory) {
    $scope.app = appConstant.app;

    $scope.isActive = function(stateName, isParent) {
      return $state.$current.parent.self.name === stateName;
    };

    $scope.checkPermission = function(nav) {
      return permissionFactory.checkPermission(nav);
    };
  }];
  return controller;
});