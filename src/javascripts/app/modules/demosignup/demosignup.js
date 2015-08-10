/**
 * Created by thophan on 8/10/2015.
 */
define(function(require) {
    'use strict';
    var angular = require('angular'),
        config = require('app/config'),
        controller = require('./controllers/demosignup'),
        accountServiceModule = require('app/common/services/account'),
        template = require('text!./templates/demosignup.html');
    var module = angular.module('app.demosignup', ['ui.router', 'app.config', 'common.services.account', 'common.services.countries']);
    module.run(['$templateCache', function($templateCache) {
        $templateCache.put('demosignup/templates/demosignup.html', template);
    }]);
    module.controller('DemoSignUpController', controller);
    module.config(
        ['$stateProvider',
            function($stateProvider) {
                $stateProvider
                    .state('demosignup', {
                        url: '/demo-signup?email',
                        templateUrl: "demosignup/templates/demosignup.html",
                        controller: 'DemoSignUpController',
                        authorization: false,
                        resolve: {
                            authorized: ['$rootScope', 'userContext', '$location', function($rootScope, userContext, $location) {
                                if (userContext.authentication().isAuth) {
                                    $location.path("/dashboard");
                                }
                                return true;
                            }]
                        }
                    });
            }
        ]
    );

    return module;
});