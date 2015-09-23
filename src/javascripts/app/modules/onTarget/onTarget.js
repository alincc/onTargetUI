/**
 * Created by aashiskhanal on 9/1/15.
 */

define(function(require) {
    'use strict';
    var angular = require('angular'),
        uiRouter = require('uiRouter'),
        config = require('app/config'),
        template = require('text!./templates/onTarget.html'),

        controller = require('./controllers/onTarget'),

        projectContextModule = require('app/common/context/project'),
        angularLocalStorage = require('angularLocalStorage'),

        onSiteServiceModule = require('app/common/services/onTarget'),
        utilServiceModule = require('app/common/services/util'),
        angularSanitize = require('angularSanitize'),
      colorFilter = require('app/common/filters/task'),
      projectServiceModule = require('app/common/services/project');

    var module = angular.module('app.onTarget', ['ui.router', 'app.config', 'common.context.project', 'angularLocalStorage', 'ui.select', 'common.services.file', 'common.services.onTarget', 'common.services.util', 'ngSanitize', 'common.services.permission', 'common.filters.task', 'common.services.project']);
    module.run(['$templateCache', function($templateCache) {
        $templateCache.put('onTarget/templates/onTarget.html', template);
    }]);

    module.controller('OnTargetController', controller);

    module.config(
        ['$stateProvider',
            function($stateProvider) {
                $stateProvider
                    .state('app.onTarget', {
                        url: '/onTarget',
                        templateUrl: 'onTarget/templates/onTarget.html',
                        controller: 'OnTargetController',
                        reloadOnSearch: false,
                        resolve: {
                            projectValid: ['$location', 'projectContext', '$q', '$state', '$window', 'permissionFactory', function($location, projectContext, $q, $state, $window, permissionFactory) {
                                var deferred = $q.defer();
                                if(projectContext.valid() && permissionFactory.checkMenuPermission('ONTARGET')) {
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

