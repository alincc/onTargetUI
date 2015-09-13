/**
 * Created by thophan on 8/21/2015.
 */
define(function(require) {
  'use strict';
  var angular = require('angular'),
    lodash = require('lodash');

  var controller = ['$scope', '$rootScope', 'countryFactory', 'projectFactory', 'userContext', 'projectContext', 'activityFactory', 'toaster', 'taskFactory', 'notifications',
    function($scope, $rootScope, countryFactory, projectFactory, userContext, projectContext, activityFactory, toaster, taskFactory, notifications) {
      console.log($rootScope.currentTask);
      $scope.model = {
        percentageComplete: '',
        percentageType: "PERCENTAGE",
        taskId: $rootScope.currentTask.projectTaskId,
        taskPercentageLogId : ''
      };
      $scope.model.percentageComplete = $rootScope.currentTask.percentageComplete;


      $scope.updateProgress = function() {
        //taskProgressList[0].taskPercentageLogId
        taskFactory.createTaskPercentage({
          taskProgressList: $scope.model
        }).then(function(resp) {
            $rootScope.currentTask.percentageComplete = $scope.model.percentageComplete;
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