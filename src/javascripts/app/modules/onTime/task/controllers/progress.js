/**
 * Created by thophan on 8/21/2015.
 */
define(function(require) {
  'use strict';
  var angular = require('angular'),
    lodash = require('lodash');

  var controller = ['$scope', '$rootScope', 'countryFactory', 'projectFactory', 'userContext', 'projectContext', 'activityFactory', 'toaster', 'taskFactory', 'notifications',
    function($scope, $rootScope, countryFactory, projectFactory, userContext, projectContext, activityFactory, toaster, taskFactory, notifications) {
      $scope.model = {
        percentageComplete: '',
        percentageType: "PERCENTAGE",
        taskId: $rootScope.currentTask.projectTaskId
      };
      $scope.model.percentageComplete = $rootScope.currentTask.percentageComplete;


      $scope.updateProgress = function() {
        taskFactory.updateTaskPercentage({
          taskProgressList: $scope.model
        }).then(function(resp) {
            notifications.taskUpdated({
              projectTaskId: $rootScope.currentTask.projectTaskId,
              task: {
                percentageComplete: $scope.model.percentageComplete
              }
            });
          }
        );
      };
    }];
  return controller;
});