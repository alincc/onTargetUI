/**
 * Created by thophan on 8/7/2015.
 */

define(function() {
    'use strict';
    var controller = ['$scope', 'userContext', '$state', 'appConstant', 'accountFactory', function($scope, userContext, $state, appConstant, accountFactory) {

        $scope.app = appConstant.app;
        $scope.authError = '';
        
        $scope.signout = function () {
            accountFactory.logout().then(
                function () {
                    $state.go('signin');
                }, function () {
                    
                }
            );
        };

    }];
    return controller;
});
