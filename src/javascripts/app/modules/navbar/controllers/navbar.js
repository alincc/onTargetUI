define(function() {
  'use strict';
  var controller = ['$scope', 'appConstant', 'accountFactory', '$state', '$location', 'notifications', function($scope, appConstant, accountFactory, $state, $location, notifications) {
    $scope.app = appConstant.app;
    $scope.logout = function() {
      accountFactory.logout()
        .then(function() {
          notifications.logoutSuccess();
          $state.go('signin');
        });
    };
  }];
  return controller;
});