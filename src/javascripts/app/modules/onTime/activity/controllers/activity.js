define(function(require) {
  'use strict';
  var angular = require('angular'),
    lodash = require('lodash');
  var controller = ['$scope', '$rootScope', '$modal', 'companyFactory', 'projectFactory', 'projectContext', 'userContext', 'notifications', function($scope, $rootScope, $modal, companyFactory, projectFactory, projectContext, userContext, notifications) {
    var createActivityModalInstance, editActivityModalInstance, deleteActivityModalInstance;
    var currentProjectId = $rootScope.currentProjectInfo.projectId;
    //$scope.currentProjectName = $rootScope.currentProjectInfo.projectName;


    $scope.currentProject = [];
    $scope.activities = [];
    $scope.activitySelected = $rootScope.activitySelected = null;
    $scope.model = {
      userId: userContext.authentication().userData.userId
    };

    $scope.currentProject = $rootScope.currentProjectInfo;
    $scope.activities = $scope.currentProject.projects;

    //call api get projects
    $scope.getUserProject = function() {
      projectFactory.getUserProject($scope.model).then(
        function(resp) {
          $scope.projects = resp.data.mainProject.projects;
          $scope.getCurrentProjectActivities();

          // save project to local storage
          projectContext.setProject(null, resp.data.mainProject);
        },
        function() {
          $scope.isLoading = false;
        }
      );
    };
    //$scope.getUserProject();

    $scope.getCurrentProjectActivities = function() {
      var currentProject = _.where($scope.projects, {projectId: currentProjectId})[0];
      if(currentProject) {
        projectContext.setProject(currentProject);
        $scope.activities = currentProject.projects;
      }
    };

    $scope.selectActiity = function(activity) {
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
          $scope.activitySelected = null;
          $scope.getUserProject();
        });
    };
  }];
  return controller;
});
