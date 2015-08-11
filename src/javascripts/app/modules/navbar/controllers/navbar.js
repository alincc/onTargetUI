define(function() {
  'use strict';
  var controller = ['$scope', 'appConstant', 'accountFactory', '$state', '$location', 'notifications', '$rootScope', function($scope, appConstant, accountFactory, $state, $location, notifications, $rootScope) {
    $scope.app = appConstant.app;

    $scope.userInfo = {
      firstName: $rootScope.currentUserInfo.contact.firstName,
      lastName: $rootScope.currentUserInfo.contact.lastName,
      email: $rootScope.currentUserInfo.contact.email,
      avatar: $rootScope.currentUserInfo.contact.userImagePath
    };

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