/**
 * Created by thophan on 8/17/2015.
 */
define(function() {
  'use strict';
  var controller = ['$scope', '$rootScope', 'userContext', 'taskFactory', 'activityFactory', 'toaster', 'notifications', function ($scope, $rootScope, userContext, taskFactory, activityFactory, toaster, notifications){

    $scope.editTask = true;
    $scope.currenttask = $rootScope.currentTask;
    $scope.task = {
      projectTaskId : $scope.currenttask.projectTaskId,
      title : $scope.currenttask.title,
      description : $scope.currenttask.description,
      status : $scope.currenttask.status,
      severity : $scope.currenttask.severity,
      startDate : new Date($scope.currenttask.startDate),
      endDate : new Date($scope.currenttask.endDate),
      projectId : $scope.currenttask.projectId
    };

    $scope.model = {
      userId: userContext.authentication().userData.userId,
      task: $scope.task
    };

    $scope.taskStatuses = taskFactory.getTaskStatuses();
    $scope.taskSeverities = taskFactory.getTaskSeverities();

    $scope.minDate2 = $rootScope.activitySelected.startDate;
    $scope.maxDate2 = $rootScope.activitySelected.endDate;
    $scope.$watchCollection('[task.startDate, task.endDate]', function(e){
      $scope.minDate = $scope.task.startDate ? $scope.task.startDate : $rootScope.activitySelected.startDate;
      $scope.maxDate = $scope.task.endDate ? $scope.task.endDate : $rootScope.activitySelected.endDate;
    });

    $scope.startDate = {
      options: {
        formatYear: 'yyyy',
        startingDay: 1
      },
      isOpen: false,
      open: function($event) {
        this.isOpen = true;
      }
    };

    $scope.endDate = {
      options: {
        formatYear: 'yyyy',
        startingDay: 1
      },
      isOpen: false,
      open: function($event) {
        this.isOpen = true;
      }
    };

    $scope.onSubmit = false;

    $scope.save = function() {
      $scope.onSubmit = true;
      taskFactory.updateTask($scope.model).then(
        function(resp) {
          $scope.onSubmit = false;
          /*$scope.currentProject.projects.push($scope.project);
           projectContext.setProject($scope.currentProject, null);*/
          toaster.pop('success', 'Success', resp.data.returnMessage);
          $scope.task_form.$setPristine();
          notifications.taskUpdated();
        }, function (err){
          $scope.onSubmit = false;
          $scope.task_form.$setPristine();
        }
      );
    };

    $scope.cancel = function (){
      notifications.taskCancel();
    };
  }];
  return controller;
});
