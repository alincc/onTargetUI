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
    Chart = require('chartjs'),
    angularChartJS = require('angularChartJS');
  var module = angular.module('app.dashboard', ['ui.router', 'app.config', 'common.context.user', 'common.services.account', 'common.context.project', 'common.services.util', 'chart.js']);

  module.run(['$templateCache', function($templateCache) {
    Chart.defaults.global.colours=[
      '#06bf3f', // green
      '#ff7e00', // orange
      '#4279bd', // blue
      '#46BFBD', // green
      '#FDB45C', // yellow
      '#949FB1', // grey
      '#4D5360'  // dark grey
    ];
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
              projectValid: ['$location', 'projectContext', '$q', '$state', '$window', 'utilFactory', '$rootScope', function($location, projectContext, $q, $state, $window, utilFactory, $rootScope) {
                var deferred = $q.defer();
                if(projectContext.valid()) {
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
