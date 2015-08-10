define(function() {
    'use strict';
    var controller = ['$scope', 'userContext', '$state', 'appConstant', 'accountFactory', function($scope, userContext, $state, appConstant, accountFactory) {
        $scope.user = {
            username: ''
        };

        $scope.app = appConstant.app;
        $scope.authError = '';

        $scope.forgotPassword = function(user) {
            accountFactory.forgotPassword(user)
                .then(function(resp) {
                    if(resp.data.returnVal === "ERROR"){
                        //request forgot password error
                        $scope.authError = resp.data.returnMessage;
                    }
                    else {
                        $scope.form.$setPristine();
                        $state.go('signin');
                    }
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