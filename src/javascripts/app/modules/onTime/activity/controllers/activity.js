define(function(require) {
  'use strict';
  var angular = require('angular'),
    lodash = require('lodash');
  var controller = ['$scope', '$rootScope', '$modal', 'companyFactory', 'projectFactory', 'projectContext', 'userContext', 'notifications', 'activityFactory', '$q', '$location', '$stateParams', 'appConstant',
    function($scope, $rootScope, $modal, companyFactory, projectFactory, projectContext, userContext, notifications, activityFactory, $q, $location, $stateParams, appConstant) {
      var createActivityModalInstance, editActivityModalInstance, deleteActivityModalInstance;
      var currentProjectId;
      var canceler;
      $scope.isLoadingActivity = false;
      $scope.app = appConstant.app;

      function load(cb) {
        currentProjectId = $rootScope.currentProjectInfo.projectId;
        $scope.currentProject = [];
        $scope.isLoadingActivity = false;
        $scope.activities = [];
        $scope.activitySelected = $rootScope.activitySelected = null;
        $scope.model = {
          userId: userContext.authentication().userData.userId
        };

        $scope.currentProject = $rootScope.currentProjectInfo;

        $scope.loadActivity(cb);

        // remap data, add task active and pending counter
        $scope.mapData();
      }

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

      //call api get projects
      $scope.getUserProject = function() {
        canceler = $q.defer();
        projectFactory.getUserProject($scope.model, canceler).then(
          function(resp) {
            $scope.projects = resp.data.mainProject.projects;
            $scope.getCurrentProjectActivities();
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

        // Update route
        $location.search('activityId', activity.projectId);

        notifications.activitySelection();
      };

      // Create activity
      /*$scope.openCreateActivityModal = function() {
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
              //$scope.getUserProject();
              //load();
              $scope.loadActivity();
            }, function() {
            });
          });
      };*/

      $scope.createActivity = function (){
        companyFactory.search()
          .success(function(resp) {
            $rootScope.companies = resp.companyList;
            notifications.createActivity();
          });
      };

      $scope.editActivity = function (){
        companyFactory.search()
          .success(function(resp) {
            $rootScope.companies = resp.companyList;
            notifications.editActivity();
          });
      };

      // Edit activity
     /* $scope.openEditActivityModal = function() {
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
              //$scope.getUserProject();
              //load();
              $scope.loadActivity();
            }, function() {

            });
          });
      };*/

      // Delete activity
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
            console.log('Close modal callback');
            if(canceler) {
              canceler.resolve();
            }
            // Remove activity from list
            _.remove($scope.activities, {projectId: $scope.activitySelected.projectId});
            $scope.activitySelected = $rootScope.activitySelected = null;
            notifications.activityDeleted();
            // Change route
            $location.search('activityId', null);
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
          console.log('Reload activity');
          $location.search('activityId', null);
          $scope.loadActivity();
          $scope.activitySelected = $rootScope.activitySelected = null;
        }, function() {

        });
      };

      //when task added, or deleted
      notifications.onTaskCreated($scope, function() {
        //$scope.getUserProject();
        $scope.loadActivity();
      });

      notifications.onTaskUpdated($scope, function(obj) {
        /*if(!obj) {
          //$scope.getUserProject();
          //load();
          $scope.loadActivity();
        }*/
        $scope.loadActivity();
      });

      notifications.onTaskDeleted($scope, function() {
        //$scope.getUserProject();
        $scope.loadActivity();
      });

      // Events
      notifications.onCurrentProjectChange($scope, function(agrs) {
        // Update route
        $location.search('activityId', null);
        if(canceler) {
          canceler.resolve();
        }
        load();
        //$scope.loadActivity();
      });

      $scope.$on('$destroy', function() {
        if(canceler) {
          canceler.resolve();
        }
      });

      load(function() {
        if($stateParams.activityId) {
          var foundActivity = _.find($scope.activities, {projectId: parseInt($stateParams.activityId)});
          if(foundActivity) {
            $scope.selectActivity(foundActivity);
          } else {
            // Update route
            $location.search('activityId', null);
          }
        }
      });

      notifications.onActivityCreated($scope, function() {
        $scope.loadActivity();
      });

      notifications.onActivityEdited($scope, function() {
        $scope.loadActivity();
      });

    }];
  return controller;
});
