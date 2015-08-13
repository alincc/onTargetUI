/**
 * Created by thophan on 8/10/2015.
 */
define(function() {
    'use strict';
    var controller = ['$scope', 'userContext', '$state', 'appConstant', 'accountFactory', function($scope, userContext, $state, appConstant, accountFactory) {
        $scope.user = {
            email: ''
        };

        $scope.app = appConstant.app;
        $scope.authError = '';

        $scope.requestDemo = function(model, form) {
            if(form.$invalid)
            {
                return false;
            }
            $state.go('demosignup', {email: model.email});
        };
    }];
    return controller;
});
