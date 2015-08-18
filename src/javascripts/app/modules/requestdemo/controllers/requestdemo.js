define(function() {
  'use strict';
  var controller = ['$scope', 'userContext', '$state', 'appConstant', function($scope, userContext, $state, appConstant) {
    $scope.user = {
      email: ''
    };

    $scope.app = appConstant.app;

    $scope.authError = '';

    $scope.requestDemo = function(model) {
      if($scope.form.$invalid) {
        return false;
      }
      $state.go('demosignup', {email: model.email});
    };
  }];
  return controller;
});
