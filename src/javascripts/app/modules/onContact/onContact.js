/**
 * Created by aashiskhanal on 9/1/15.
 */

define(function(require) {
    'use strict';
    var angular = require('angular'),
        uiRouter = require('uiRouter'),
        config = require('app/config'),
        template = require('text!./templates/onContact.html'),

        controller = require('./controllers/onContact'),

        projectContextModule = require('app/common/context/project'),



        angularLocalStorage = require('angularLocalStorage'),

        onSiteServiceModule = require('app/common/services/onContact'),
        utilServiceModule = require('app/common/services/util'),
        angularSanitize = require('angularSanitize');

    var module = angular.module('app.onContact', ['ui.router', 'app.config', 'common.context.project', 'angularLocalStorage', 'ui.select', 'common.services.file', 'common.services.onContact', 'common.services.util', 'ngSanitize', 'common.services.permission']);
    module.run(['$templateCache', function($templateCache) {
        $templateCache.put('onContact/templates/onContact.html', template);
    }]);

    module.controller('OnContactController', controller);

    module.config(
        ['$stateProvider',
            function($stateProvider) {
                $stateProvider
                    .state('app.onContact', {
                        url: '/onContact',
                        templateUrl: 'onContact/templates/onContact.html',
                        controller: 'OnContactController',
                        reloadOnSearch: false,
                        resolve: {
                            projectValid: ['$location', 'projectContext', '$q', '$state', '$window', 'permissionFactory', function($location, projectContext, $q, $state, $window, permissionFactory) {
                                var deferred = $q.defer();
                                if(projectContext.valid() && permissionFactory.checkPermission('ONCONTACT')) {
                                    deferred.resolve();
                                } else {
                                    $window.location.href = $state.href('app.projectlist');
                                }
                                return deferred.promise;
                            }]
                        }
                    });
            }
        ]
    );

    return module;
});

