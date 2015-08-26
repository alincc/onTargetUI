/**
 * Created by thophan on 8/18/2015.
 */
define(function() {
  'use strict';
  var controller = ['$scope', '$rootScope', '$modal', 'companyFactory', 'projectFactory', 'projectContext', 'userContext', 'taskFactory', 'notifications', '$timeout', 'appConstant', '$q',
    function($scope, $rootScope, $modal, companyFactory, projectFactory, projectContext, userContext, taskFactory, notifications, $timeout, appConstant, $q) {
      var createTaskModalInstance, editTaskModalInstance, deleteTaskModalInstance;
      var canceler;

      var loadProjectTasks = function() {
        if(canceler) {
          canceler.resolve();
        }
        canceler = $q.defer();
        $scope.isLoadingTasks = true;
        taskFactory.getProjectTasks($scope.model, canceler).then(
          function(resp) {
            $scope.tasks = resp.data.tasks;
            $scope.isLoadingTasks = false;
            $timeout(function() {
              $scope.$broadcast('content.reload');
            }, 200);
          },
          function() {
            $scope.isLoadingTasks = false;
          }
        );
      };

      var bindTasks = function() {
        if($rootScope.activitySelected) {
          $scope.model.projectId = $rootScope.activitySelected.projectId;
          loadProjectTasks();
        }
      };

      $scope.app = appConstant.app;

      $scope.model = {
        projectId: 0
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

      $scope.isLoadingTasks = false;

      $scope.action = $scope.actions.infoTask;

      $scope.addTask = function() {
        taskFactory.getContacts({projectId: $rootScope.currentProjectInfo.projectId}).then(function(resp) {
          $rootScope.contactList = resp.data.projectMemberList;
          $scope.action = $scope.actions.addTask;
          $scope.taskSelected = {};
        });
      };

      $scope.tasks = [];

      $scope.selectTask = function(task) {
        $scope.taskSelected = $rootScope.currentTask = task;
        $scope.action = $scope.actions.infoTask;
        notifications.taskSelection({task: $scope.taskSelected, action: 'info'});
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
              loadProjectTasks();
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

      bindTasks();

      notifications.onTaskCreated($scope, function(args) {
        loadProjectTasks();
        $scope.taskSelected = null;
      });

      notifications.onTaskUpdated($scope, function(obj) {
        if(obj) {
          if(obj.reload) {
            loadProjectTasks();
          }
          if(obj.clear) {
            $scope.taskSelected = null;
          }
          if(obj.task) {
            var foundTaskInList = _.where($scope.tasks, {
              projectTaskId: obj.projectTaskId
            })[0];

            console.log(foundTaskInList, obj.task);
            if(foundTaskInList) {
              foundTaskInList = angular.extend(foundTaskInList, obj.task);
            }
          }
        }
      });

      notifications.onTaskCancel($scope, function() {
        $scope.taskSelected = null;
      });

      notifications.onActivitySelection($scope, function() {
        $scope.tasks = [];
        $scope.taskSelected = null;
        bindTasks();
      });

      notifications.onActivityDeleted($scope, function() {
        $scope.tasks = [];
        $scope.taskSelected = null;
        bindTasks();
      });

      notifications.onTaskSelection($scope, function(args) {
        if(args.action === 'info') {
          $scope.action = $scope.actions.infoTask;
        }
        else if(args.action === 'add') {
          $scope.action = $scope.actions.addTask;
        }
        else if(args.action === 'edit') {
          $scope.action = $scope.actions.editTask;
        }
        else if(args.action === 'logistic') {
          $scope.action = $scope.actions.logistic;
        }
      });
    }];
  return controller;
});
