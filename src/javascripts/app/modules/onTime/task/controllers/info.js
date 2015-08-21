/**
 * Created by thophan on 8/20/2015.
 */
define(function(require) {
  'use strict';
  var angular = require('angular'),
    lodash = require('lodash');

  var controller = ['$scope', '$rootScope', 'countryFactory', 'projectFactory', 'userContext', 'projectContext', 'activityFactory', 'toaster', 'taskFactory', 'notifications',
    function($scope, $rootScope, countryFactory, projectFactory, userContext, projectContext, activityFactory, toaster, taskFactory, notifications) {

      function bind() {
        $scope.task = $rootScope.currentTask;
      }

      $scope.editTaskInformation = function() {
        notifications.taskSelection({task: $scope.task, action: 'edit'});
      };

      $scope.editTaskLogistics = function() {
        notifications.taskSelection({task: $scope.task, action: 'logistic'});
      };

      $scope.cancel = function() {
        notifications.taskCancel();
      };

      notifications.onTaskSelection($scope, function() {
        bind();
      });

      bind();

    }];
  return controller;
});