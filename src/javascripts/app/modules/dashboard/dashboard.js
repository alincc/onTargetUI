/**
 * Created by thophan on 8/7/2015.
 */
define(function(require) {
    'use strict';
    var angular = require('angular'),
        config = require('app/config'),
        controller = require('./controllers/dashboard'),
        template = require('text!./templates/dashboard.html');
    var module = angular.module('app.dashboard', ['ui.router', 'app.config', 'common.context.user', 'common.services.account']);
    module.run(['$templateCache', function($templateCache) {
        $templateCache.put('dashboard/templates/dashboard.html', template);
    }]);
    module.controller('DashBoardController', controller);
    module.config(
        ['$stateProvider',
            function($stateProvider) {
                $stateProvider
                    .state('app.dashboard', {
                        url: '/dashboard',
                        templateUrl: "dashboard/templates/dashboard.html",
                        controller: 'DashBoardController',
                        authorization: true
                    });
            }
        ]
    );

    return module;
});
