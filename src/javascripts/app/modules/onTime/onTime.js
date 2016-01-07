define(function (require) {
  'use strict';
  var angular = require('angular'),
    uiRouter = require('uiRouter'),
    template = require('text!./onTime.html'),
    controller = require('./onTimeController'),
    activityModule = require('./activity/activity'),
    taskModule = require('./task/task'),
    projectContextModule = require('app/common/context/project'),
    permissionServiceModule = require('app/common/services/permission'),
    ganttChartModule = require('./ganttChart/ganttChart'),
    notification = require('app/common/services/notifications');
  var module = angular.module('app.onTime', ['ui.router', 'app.config', 'common.context.project', 'app.activity', 'app.task', 'common.services.permission', 'app.ganttChart', 'common.services.notifications']);

  module.run(['$templateCache', function ($templateCache) {
    $templateCache.put('onTime/templates/onTime.html', template);
  }]);

  module.controller('OnTimeController', controller);

  module.config(
    ['$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('app.onTime', {
            url: '/onTime?activityId&taskId&tab',
            templateUrl: 'onTime/templates/onTime.html',
            controller: 'OnTimeController',
            reloadOnSearch: false,
            resolve: {
              projectValid: [
                '$location',
                'projectContext',
                '$q',
                '$state',
                '$window',
                'permissionFactory',
                function ($location,
                          projectContext,
                          $q,
                          $state,
                          $window,
                          permissionFactory) {
                  var deferred = $q.defer();
                  if (projectContext.valid() && permissionFactory.checkMenuPermission('ONTIME')) {
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
