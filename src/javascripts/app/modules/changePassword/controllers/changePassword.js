define(function() {
  'use strict';
  var controller = ['$scope', '$rootScope', 'changePasswordFactory',
    function($scope, $rootScope, changePasswordFactory) {
      $scope.changePassword = function() {

        var param = {
          "userId" : $rootScope.currentUserInfo.userId,
          "newPassword" : $scope.newPassword,
          "currentPassword" : $scope.currentPassword
        };

        changePasswordFactory.changePassword(param)
          .success(function() {
            $scope.newPassword = '';
            $scope.currentPassword = '';
            $scope.confirmNewPassword = '';
            $scope.form.$setPristine();
          })
          .error(function(err) {
            console.error(err);
            $scope.form.$setPristine();
          });
      };
    }];

  return controller;
});