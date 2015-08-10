define(function() {
  'use strict';
  var controller = ['$scope', 'userContext', '$state', 'appConstant', 'accountFactory', function($scope, userContext, $state, appConstant, accountFactory) {
    $scope.user = {
      email: '',
      password: '',
      confirmPassword: ''
    };

    $scope.app = appConstant.app;
    $scope.authError = '';

    $scope.signup = function(model) {
      accountFactory.register(model)
        .then(function(resp) {
          //if(resp.data.Success){
          //  // Alert here
          //}
          $scope.form.$setPristine();
          $state.go('signin');
        },
        function(er) {
          console.log(er);
          $scope.form.$setPristine();
        });
    };
  }];
  return controller;
});