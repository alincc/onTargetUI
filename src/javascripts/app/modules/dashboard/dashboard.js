/**
 * Created by thophan on 8/7/2015.
 */
define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    uiRouter = require('uiRouter'),
    controller = require('./controllers/dashboard'),
    template = require('text!./templates/dashboard.html'),
    userContextModule = require('app/common/context/user'),
    projectContextModule = require('app/common/context/project'),
    accountServiceModule = require('app/common/services/account');
  var module = angular.module('app.dashboard', ['ui.router', 'app.config', 'common.context.user', 'common.services.account', 'common.context.project']);

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
            authorization: true,
            resolve: {
              projectValid: ['$location', 'projectContext', '$q', '$state', '$window', function($location, projectContext, $q, $state, $window) {
                var deferred = $q.defer();
                if(projectContext.valid()) {
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
