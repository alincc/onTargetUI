define(function() {
  'use strict';
  var controller = ['$scope', 'userContext', '$state', 'appConstant', 'accountFactory', function($scope, userContext, $state, appConstant, accountFactory) {
    $scope.user = {
      username: ''
    };

    $scope.app = appConstant.app;
    $scope.msg = '';
    $scope.authError = '';

    $scope.forgotPassword = function(user) {
      if($scope.form.$invalid) {
        return false;
      }
      accountFactory.forgotPassword(user)
        .then(function(resp) {
          if(resp.data.returnVal === "ERROR") {
            //request forgot password error
            $scope.authError = resp.data.returnMessage;
          }
          else {
            $scope.msg = resp.data.returnMessage;
            //$state.go('signin');
          }
          $scope.form.$setPristine();
        },
        function(er) {
          console.log(er);
          //$scope.authError = er.data.returnMessage;
          $scope.form.$setPristine();
        });
    };
  }];
  return controller;
});