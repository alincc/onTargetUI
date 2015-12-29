define(function(require) {
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', '$modal', 'companyFactory', 'projectFactory', 'projectContext', 'userContext', 'taskFactory', 'notifications', '$timeout', 'appConstant', '$q', '$location', '$stateParams',
    function($scope, $rootScope, $modal, companyFactory, projectFactory, projectContext, userContext, taskFactory, notifications, $timeout, appConstant, $q, $location, $stateParams) {
      var createTaskModalInstance, editTaskModalInstance, deleteTaskModalInstance;
      var canceler;

      var loadProjectTasks = function(cb) {
        if(canceler) {
          canceler.resolve();
        }
        canceler = $q.defer();
        $scope.isLoadingTasks = true;
        taskFactory.getProjectTaskByActivity($rootScope.activitySelected.projectId, canceler).then(
          function(resp) {
            $scope.tasks = resp.data.tasks;
            $scope.isLoadingTasks = false;
            $timeout(function() {
              $scope.$broadcast('content.reload');
            }, 200);
            if(cb) {
              cb();
            }
          },
          function() {
            $scope.isLoadingTasks = false;
          }
        );
      };

      var bindTasks = function(cb) {
        if($rootScope.activitySelected) {
          $scope.model.projectId = $rootScope.activitySelected.projectId;
          loadProjectTasks(cb);
        }
      };

      $scope.app = appConstant.app;

      $scope.model = {
        projectId: 0
      };

      $scope.taskSelected = null;

      $scope.actions = {
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

      $scope.action = $scope.actions.logistic;

      $scope.addTask = function() {
        taskFactory.getContacts($rootScope.currentProjectInfo.projectId).then(function(resp) {
          $rootScope.contactList = resp.data.projectMemberList;
          $scope.action = $scope.actions.addTask;
          $scope.taskSelected = {};
          // update route
          $location.search('taskId', null);
        });
      };

      $scope.deleteTask = function() {
        taskFactory.deleteTask($scope.taskSelected.projectTaskId);
        _.remove($scope.tasks, {projectTaskId: $scope.taskSelected.projectTaskId});
        $scope.taskSelected = null;
        // update route
        $location.search('taskId', null);
      };

      $scope.tasks = [];
      var taskDetailsDefer;
      $scope.selectTask = function(task, tab) {
        tab = tab || 'info';
        if(taskDetailsDefer) {
          taskDetailsDefer.resolve();
        }
        taskDetailsDefer = $q.defer();
        taskFactory.getTaskById(task.projectTaskId, taskDetailsDefer)
          .success(function(resp) {
            $scope.taskSelected = $rootScope.currentTask = resp.task;
            //if($rootScope.backtoAttachments) {
            //  $scope.action = $scope.actions.logistic;
            //  notifications.taskSelection({task: $scope.taskSelected, action: 'logistic'});
            //} else {
            //  $scope.action = $scope.actions.infoTask;
            //  notifications.taskSelection({task: $scope.taskSelected, action: 'info'});
            //}

            $scope.action = $scope.actions.logistic;
            notifications.taskSelection({task: $scope.taskSelected, action: 'logistic', tab: tab});

            // update route
            $location.search('taskId', $scope.taskSelected.projectTaskId).search('tab', tab);
          });
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
          size: 'sm',
          resolve: {
            task: function() {
              return $scope.taskSelected;
            }
          }
        });

        deleteTaskModalInstance.result.then(function() {
          _.remove($scope.tasks, {projectTaskId: $scope.taskSelected.projectTaskId});
        }, function() {

        });
      };

      bindTasks(function() {
        if($stateParams.taskId) {
          var foundTask = _.find($scope.tasks, {projectTaskId: parseInt($stateParams.taskId)});
          if(foundTask) {
            $scope.selectTask(foundTask, $stateParams.tab);
          } else {
            // Update route
            $location.search('taskId', null);
          }
        }
      });

      notifications.onTaskCreated($scope, function(args) {
        loadProjectTasks();
        $scope.taskSelected = null;
        // update route
        $location.search('taskId', null);
      });

      notifications.onTaskUpdated($scope, function(obj) {
        console.log(obj);
        if(obj) {
          if(obj.reload) {
            loadProjectTasks();
          }
          if(obj.clear) {
            $scope.taskSelected = null;
            // update route
            $location.search('taskId', null);
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
        // update route
        $location.search('taskId', null);
      });

      notifications.onActivitySelection($scope, function() {
        $scope.tasks = [];
        $scope.taskSelected = null;
        // update route
        $location.search('taskId', null);
        bindTasks();
      });

      notifications.onActivityDeleted($scope, function() {
        $scope.tasks = [];
        $scope.taskSelected = null;
        // update route
        $location.search('taskId', null);
        bindTasks();
      });

      notifications.onTaskSelection($scope, function(args) {
        if(args.action === 'add') {
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
