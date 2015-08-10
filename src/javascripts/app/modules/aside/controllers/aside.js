define(function() {
  'use strict';
  var controller = ['$scope', 'appConstant', '$location', '$state', function($scope, appConstant, $location, $state) {
    $scope.app = appConstant.app;
    $scope.isActive = function(stateName, isParent) {
      return $state.$current.parent.self.name === stateName;
    };
  }];
  return controller;
});