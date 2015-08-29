define(function(require) {
  'use strict';
  var angular = require('angular'),
    lodash = require('lodash');
  var controller = ['$scope', '$rootScope', '$modal', 'companyFactory', 'projectFactory', 'projectContext', 'userContext', 'notifications', 'activityFactory', '$q',
    function($scope, $rootScope, $modal, companyFactory, projectFactory, projectContext, userContext, notifications, activityFactory, $q) {
    var createActivityModalInstance, editActivityModalInstance, deleteActivityModalInstance;
    var currentProjectId;
      var canceler;
    $scope.isLoadingActivity = false;

    function load() {
      currentProjectId = $rootScope.currentProjectInfo.projectId;
      $scope.currentProject = [];
      $scope.isLoadingActivity = false;
      $scope.activities = [];
      $scope.activitySelected = $rootScope.activitySelected = null;
      $scope.model = {
        userId: userContext.authentication().userData.userId
      };

      $scope.currentProject = $rootScope.currentProjectInfo;

      $scope.loadActivity();

      // remap data, add task active and pending counter
      $scope.mapData();
    }

    $scope.loadActivity = function() {
      canceler = $q.defer();
      $scope.isLoadingActivity = true;
      activityFactory.getActivityOfProject($scope.currentProject.projectId, canceler)
        .success(function(resp) {
          $scope.activities = resp.projects;
          $scope.isLoadingActivity = false;
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

    //call api get projects
    $scope.getUserProject = function() {
      canceler = $q.defer();
      projectFactory.getUserProject($scope.model, canceler).then(
        function(resp) {
          $scope.projects = resp.data.mainProject.projects;

          $scope.getCurrentProjectActivities();

          // save main project to local storage
          projectContext.setProject(null, resp.data.mainProject);
        },
        function() {
          $scope.isLoading = false;
        }
      );
    };

    $scope.getCurrentProjectActivities = function() {
      var currentProject = _.where($scope.projects, {projectId: currentProjectId})[0];
      if(currentProject) {
        $scope.activities = currentProject.projects;

        // save current project to local storage
        projectContext.setProject(currentProject);

        $scope.mapData();
      }
    };

    $scope.selectActivity = function(activity) {
      $scope.activitySelected = $rootScope.activitySelected = activity;
      notifications.activitySelection();
    };

    $scope.openCreateActivityModal = function() {
      companyFactory.search()
        .success(function(resp) {
          createActivityModalInstance = $modal.open({
            templateUrl: 'onTime/activity/templates/create.html',
            controller: 'CreateActivityController',
            size: 'lg',
            resolve: {
              companies: function() {
                return resp.companyList;
              }
            }
          });

          createActivityModalInstance.result.then(function() {
            //add success
            $scope.getUserProject();
          }, function() {
          });
        });
    };

    $scope.openEditActivityModal = function() {
      // prepare company list
      companyFactory.search()
        .success(function(resp) {
          editActivityModalInstance = $modal.open({
            templateUrl: 'onTime/activity/templates/edit.html',
            controller: 'EditActivityController',
            size: 'lg',
            resolve: {
              activity: function() {
                return $scope.activitySelected;
              },
              companies: function() {
                return resp.companyList;
              }
            }
          });

          editActivityModalInstance.result.then(function() {
            //edit success
            $scope.getUserProject();
          }, function() {

          });
        });
    };

    $scope.openDeleteActivityModal = function() {
      deleteActivityModalInstance = $modal.open({
        templateUrl: 'onTime/activity/templates/delete.html',
        controller: 'DeleteActivityController',
        size: 'lg',
        resolve: {
          activity: function() {
            return $scope.activitySelected;
          }
        }
      });

      deleteActivityModalInstance.result.then(
        function() {
          //delete success
          $scope.activitySelected = $rootScope.activitySelected = null;
          $scope.getUserProject();
          notifications.activityDeleted();
        });
    };

    // Import
    var importModalInstance;
    $scope.import = function() {
      // open modal
      importModalInstance = $modal.open({
        templateUrl: 'onTime/activity/templates/import.html',
        controller: 'ImportActivityController',
        size: 'lg'
      });

      // modal callbacks
      importModalInstance.result.then(function() {

      }, function() {

      });
    };

    //when task added, or deleted
    notifications.onTaskCreated($scope, function() {
      $scope.getUserProject();
    });

    notifications.onTaskUpdated($scope, function(obj) {
      if(!obj) {
        $scope.getUserProject();
      }
    });
    notifications.onTaskDeleted($scope, function() {
      //$scope.getUserProject();
    });

    // Events
    notifications.onCurrentProjectChange($scope, function(agrs) {
      load();
    });

      $scope.$on('$destroy', function(){
        if(canceler) {
          canceler.resolve();
        }
      });

    load();
  }];
  return controller;
});
