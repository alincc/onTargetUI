/**
 * Created by thophan on 8/21/2015.
 */
define(function(require) {
  'use strict';
  var angular = require('angular'),
    lodash = require('lodash');

  var controller = ['$scope', '$rootScope', 'countryFactory', 'projectFactory', 'userContext', 'projectContext', 'activityFactory', 'toaster', 'taskFactory', 'notifications', 'permissionFactory',
    function($scope, $rootScope, countryFactory, projectFactory, userContext, projectContext, activityFactory, toaster, taskFactory, notifications, permissionFactory) {
      console.log($rootScope.currentTask);
      $scope.model = {
        percentageComplete: '',
        percentageType: "PERCENTAGE",
        taskId: $rootScope.currentTask.projectTaskId,
        taskPercentageLogId : ''
      };
      $scope.model.percentageComplete = $rootScope.currentTask.percentageComplete;


      $scope.updateProgress = function() {
        if(!$scope.isEdit) {
          return;
        }
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

      $scope.isEdit = false;
      var checkPermission = function (){
        if(permissionFactory.checkFeaturePermission('ADD_TASK_PERCENTAGE') || permissionFactory.checkFeaturePermission('EDIT_TASK_PERCENTAGE')) {
          $scope.isEdit = true;
        }
      };
      checkPermission();

    }];
  return controller;
});