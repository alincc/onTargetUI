/**
 * Created by thophan on 8/17/2015.
 */
define(function() {
  'use strict';
  var controller = ['$scope', '$rootScope', 'userContext', 'taskFactory', 'activityFactory', 'toaster', 'notifications', '$filter', function($scope, $rootScope, userContext, taskFactory, activityFactory, toaster, notifications, $filter) {

    $scope.editTask = true;
    $scope.currenttask = $rootScope.currentTask;
    $scope.task = {
      projectTaskId: $scope.currenttask.projectTaskId,
      title: $scope.currenttask.title,
      description: $scope.currenttask.description,
      status: $scope.currenttask.status,
      severity: $scope.currenttask.severity,
      startDate: $scope.currenttask.startDate,
      endDate: $scope.currenttask.endDate,
      projectId: $rootScope.activitySelected.projectId
    };

    $scope.model = {
      userId: userContext.authentication().userData.userId,
      task: $scope.task
    };

    $scope.taskStatuses = taskFactory.getTaskStatuses();
    $scope.taskSeverities = taskFactory.getTaskSeverities();

    $scope.minDate2 = $rootScope.activitySelected.startDate;
    $scope.maxDate2 = $rootScope.activitySelected.endDate;
    $scope.initStartDate = new Date($scope.minDate2);
    $scope.$watchCollection('[task.startDate, task.endDate]', function(e) {
      $scope.minDate = $scope.task.startDate ? $scope.task.startDate : $rootScope.activitySelected.startDate;
      $scope.maxDate = $scope.task.endDate ? $scope.task.endDate : $rootScope.activitySelected.endDate;
      $scope.initEndDate = new Date($scope.minDate);
      $scope.task.startDate= $filter('date')($scope.task.startDate, 'yyyy-MM-dd');
      $scope.task.endDate= $filter('date')($scope.task.endDate, 'yyyy-MM-dd');
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
          $scope.task_form.$setPristine();
          notifications.taskUpdated({
            projectTaskId: $rootScope.currentTask.projectTaskId,
            clear: true,
            task: {
              title: $scope.task.title,
              severity: $scope.task.severity,
              endDate: $scope.task.endDate,
              startDate: $scope.task.startDate
            }
          });
        }, function(err) {
          $scope.onSubmit = false;
          $scope.task_form.$setPristine();
        }
      );
    };

    $scope.cancel = function() {
      notifications.taskSelection({
        action: 'info'
      });
    };
  }];
  return controller;
});
