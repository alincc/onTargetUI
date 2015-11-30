define(function(require) {
  'use strict';
  var angular = require('angular'),
    _ = require('lodash');
  var directive = [function() {
    return {
      restrict: 'E',
      scope: {},
      controller: [
        '$scope',
        '$rootScope',
        '$q',
        'activityFactory',
        'taskFactory',
        '$timeout',
        'onSiteFactory',
        function($scope,
                 $rootScope,
                 $q,
                 activityFactory,
                 taskFactory,
                 $timeout,
                 onSiteFactory) {
          var canceler, taskCanceler;
          $scope.isLoadingActivity = false;
          $scope.isLoadingTasks = false;
          $scope.isLinkingTask = false;
          $scope.isCreatingTask = false;
          $scope.currentProject = $rootScope.currentProjectInfo;
          $scope.activities = [];
          $scope.tasks = [];
          $scope.isCreateTask = false;
          $scope.loadActivity = function(cb) {
            if(canceler) {
              canceler.resolve();
            }
            canceler = $q.defer();
            $scope.isLoadingActivity = true;
            activityFactory.getActivityOfProject($scope.currentProject.projectId, canceler)
              .success(function(resp) {
                $scope.activities = resp.projects;
                $scope.isLoadingActivity = false;
                if(cb) {
                  cb();
                }
              })
              .error(function(err) {
                $scope.isLoadingActivity = false;
              });
          };
          $scope.mapData = function() {
            _.map($scope.activities, function(el) {
              var newEl = el;
              newEl.activeTasks = _.where(el.taskList, {status: "1"}).length;
              newEl.pendingTasks = _.where(el.taskList, {status: "2"}).length;
              return newEl;
            });
          };
          $scope.selectActivity = function(activity) {
            $scope.activitySelected = $rootScope.activitySelected = activity;
            if(taskCanceler) {
              taskCanceler.resolve();
            }
            taskCanceler = $q.defer();
            $scope.isLoadingTasks = true;
            $scope.tasks = [];
            taskFactory.getProjectTaskByActivity($scope.activitySelected.projectId, taskCanceler).then(
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
          $scope.createTask = function() {
            taskFactory.getContacts($rootScope.currentProjectInfo.projectId).then(function(resp) {
              $rootScope.contactList = resp.data.projectMemberList;
              $scope.newTask = {
                projectTaskId: null,
                title: "",
                description: "",
                status: "",
                severity: "",
                startDate: "",
                endDate: "",
                projectId: $scope.activitySelected.projectId,
                selectedAssignees: []
              };
              $scope.isCreateTask = true;
              $scope.model = {
                userId: $rootScope.currentUserInfo.userId,
                task: $scope.newTask
              };
            });
          };
          $scope.backToSelectActivity = function() {
            $scope.activitySelected = $rootScope.activitySelected = null;
          };
          $scope.backToSelectTask = function() {
            $scope.isCreateTask = false;
          };
          $scope.selectTask = function(task) {
            if($scope.isLinkingTask) {
              return;
            }

            if(!$rootScope.currentProjectFileTag.isNew) {
              $scope.isLinkingTask = true;
              onSiteFactory.linkTask($rootScope.currentProjectFileTag.projectFileTagId, task.projectTaskId)
                .success(function() {
                  $scope.isLinkingTask = false;
                  $scope.isCreateTask = false;
                  $scope.activitySelected = $rootScope.activitySelected = null;
                  $rootScope.$broadcast('linkTask.Completed', {
                    projectFileTag: $rootScope.currentProjectFileTag,
                    taskId: task.projectTaskId
                  });
                })
                .error(function(err) {
                  $scope.isLinkingTask = false;
                });
            } else {
              $rootScope.currentProjectFileTag.linkTaskId = task.projectTaskId;
              $rootScope.$broadcast('linkTask.Completed', {
                projectFileTag: $rootScope.currentProjectFileTag,
                taskId: task.projectTaskId
              });
            }
          };
          $scope.saveTask = function() {
            $scope.isCreatingTask = true;
            // Filter assignees
            $scope.model.task.assignees = _.map($scope.model.task.selectedAssignees, function(el) {
              return el.userId;
            });
            taskFactory.addTask($scope.model)
              .then(function(resp) {
                $scope.isCreatingTask = false;
                $scope.selectTask({
                  projectTaskId: resp.data.task.projectTaskId
                });
              }, function(err) {
                $scope.isCreatingTask = false;
              });
          };
          $scope.loadActivity();
          // remap data, add task active and pending counter
          $scope.mapData();
        }],
      templateUrl: 'documentPreview/templates/linkTask.html',
      link: function(scope, elem, attrs) {

      }
    };
  }];
  return directive;
});