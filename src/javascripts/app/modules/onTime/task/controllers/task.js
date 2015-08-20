/**
 * Created by thophan on 8/18/2015.
 */
define(function() {
  'use strict';
  var controller = ['$scope', '$rootScope', '$modal', 'companyFactory', 'projectFactory', 'projectContext', 'userContext', 'taskFactory', 'notifications', function($scope, $rootScope, $modal, companyFactory, projectFactory, projectContext, userContext, taskFactory, notifications) {
    var createTaskModalInstance, editTaskModalInstance, deleteTaskModalInstance;
    $scope.model = {
      projectId: $rootScope.activitySelected.projectId
    };
    $scope.taskSelected = null;
    $scope.actions = {
      infoTask: {
        name: "infoTask",
        text: "Information"
      },
      addTask: {
        name: "addTask",
        text: "Add Task"
      },
      editTask: {
        name: "editTask",
        text: "Edit Task"
      },
      logistic: {
        name: "logisticTask",
        text: "Logistics"
      }
    };

    $scope.action = $scope.actions.infoTask;

    $scope.editTaskInformation = function() {
      $scope.action = $scope.actions.editTask;
    };

    $scope.editTaskLogistics = function() {
      $scope.action = $scope.actions.logistic;
    };

    $scope.addTask = function() {
      $scope.taskSelected = {};
      $scope.action = $scope.actions.addTask;
    };

    $scope.tasks = [];
    //$scope.tasks = $rootScope.activitySelected.taskList;

    var loadProjectTasks = function() {
      taskFactory.getProjectTasks($scope.model).then(
        function(resp) {
          $scope.tasks = resp.data.tasks;
        }
      );
    };
    loadProjectTasks();

    notifications.onTaskCreated($scope, function() {
      loadProjectTasks();
      $scope.action = $scope.actions.infoTask;
    });

    notifications.onTaskUpdated($scope, function() {
      loadProjectTasks();
    });

    notifications.onTaskCancel($scope, function() {
      $scope.taskSelected = null;
    });

    var bindTasks = function() {
      $scope.model.projectId = $rootScope.activitySelected.projectId;
      loadProjectTasks();
    };

    notifications.onActivitySelection($scope, function() {
      bindTasks();
    });

    $scope.selectTask = function(task) {
      $scope.taskSelected = $rootScope.currentTask = task;
      $scope.action = $scope.actions.infoTask;
      notifications.taskSelection();
    };

    $scope.openCreateTaskModal = function() {
      companyFactory.search()
        .success(function(resp) {
          createTaskModalInstance = $modal.open({
            templateUrl: 'onTime/task/templates/create.html',
            controller: 'CreateTaskController',
            size: 'lg'
          });

          createTaskModalInstance.result.then(function() {
            //add success
            taskFactory.getProjectTasks($scope.model).then(
              function(resp) {
                $scope.tasks = resp.data.tasks;
              }
            );
          }, function() {
          });
        });
    };

    $scope.openEditTaskModal = function() {
      // prepare company list
      companyFactory.search()
        .success(function(resp) {
          editTaskModalInstance = $modal.open({
            templateUrl: 'onTime/task/templates/edit.html',
            controller: 'EditTaskController',
            size: 'lg',
            resolve: {
              task: function() {
                return $scope.taskSelected;
              }
            }
          });

          editTaskModalInstance.result.then(function() {
            //edit success
            loadProjectTasks();
          }, function() {

          });
        });
    };

    $scope.openDeleteTaskModal = function() {
      deleteTaskModalInstance = $modal.open({
        templateUrl: 'onTime/task/templates/delete.html',
        controller: 'DeleteTaskController',
        size: 'lg',
        resolve: {
          task: function() {
            return $scope.taskSelected;
          }
        }
      });

      deleteTaskModalInstance.result.then(function() {
        loadProjectTasks();
      }, function() {

      });
    };
  }];
  return controller;
});
