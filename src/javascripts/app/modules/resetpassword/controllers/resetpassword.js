/**
 * Created by thophan on 8/12/2015.
 */
define(function() {
  'use strict';
  var controller = ['$scope', '$state', 'appConstant', 'accountFactory', 'forgotPasswordTokenData', function($scope, $state, appConstant, accountFactory, forgotPasswordTokenData) {

    $scope.model = {
      newPassword: "",
      forgotPasswordToken: ""
    };
    $scope.resetMsg = '';
    $scope.authError = '';
    $scope.app = appConstant.app;

    if (forgotPasswordTokenData.returnVal === "SUCCESS") {
      $scope.model.forgotPasswordToken = forgotPasswordTokenData.collaborateToken;
    }else if (forgotPasswordTokenData.returnVal) {
      $scope.displayForm = false;
    }


    $scope.reset = function(model, form) {
      if(form.$invalid)
      {
        return false;
      }
      console.log(model);
      accountFactory.resetForgotPassword(model)
        .then(function() {
          $scope.resetMsg = 'Password changed successfully.';
          $scope.form.$setPristine();
        },
        function(er) {
          console.log(er);
          $scope.form.$setPristine();
        });
    };
  }];
  return controller;
});