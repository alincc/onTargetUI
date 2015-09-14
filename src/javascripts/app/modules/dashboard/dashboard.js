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
    accountServiceModule = require('app/common/services/account'),
    utilServiceModule = require('app/common/services/util'),
    documentServiceModule = require('app/common/services/document'),
    activityServiceModule = require('app/common/services/activity'),
    notificationsServiceModule = require('app/common/services/notifications'),
    permissionServiceModule = require('app/common/services/permission'),
    taskFilterModule = require('app/common/filters/task'),
    jPlotDirective = require('app/common/directives/jPlot/jPlot'),
    projectChooserDirective = require('app/common/directives/projectChooser/projectChooser');
  var module = angular.module('app.dashboard', ['ui.router', 'app.config', 'common.context.user', 'common.services.account', 'common.context.project', 'common.services.util', 'common.services.document', 'common.services.activity', 'common.filters.task', 'common.directives.projectChooser', 'common.services.notifications', 'common.services.permission', 'common.directives.jPlot']);

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
              projectValid: ['$location', 'projectContext', '$q', '$state', '$window', 'utilFactory', '$rootScope', 'permissionFactory',
                function($location, projectContext, $q, $state, $window, utilFactory, $rootScope, permissionFactory) {
                var deferred = $q.defer();
                if(projectContext.valid() && permissionFactory.checkPermission('DASHBOARD')) {
                  // prepare project address
                  utilFactory.generateAddress($rootScope.currentProjectInfo.projectAddress)
                    .then(function(add) {
                      $rootScope.currentProjectInfo.fullAddress1 = add;
                      $rootScope.currentProjectInfo.fullAddress2 = $rootScope.currentProjectInfo.address2;
                      projectContext.setProject(angular.copy($rootScope.currentProjectInfo));
                      deferred.resolve();
                    });
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
