define(function() {
  'use strict';
  var controller = ['$scope', '$state', 'appConstant', 'accountFactory', 'notifications',
    function($scope, $state, appConstant, accountFactory, notifications) {
      $scope.user = {
        username: '',
        password: ''
      };

      $scope.authError = '';

      $scope.app = appConstant.app;

      $scope.signin = function(model) {
        if($scope.form.$invalid) {
          return false;
        }
        accountFactory.login(model.username, model.password)
          .then(function() {
            notifications.loginSuccess();
            $scope.form.$setPristine();
            $state.go('app.projectlist');
          },
          function(er) {
            console.log(er);
            $scope.form.$setPristine();
          });
      };
    }];
  return controller;
});