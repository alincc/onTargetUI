define(function() {
  'use strict';
  var controller = ['$scope', '$state', 'appConstant', 'accountFactory', function($scope, $state, appConstant, accountFactory) {
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