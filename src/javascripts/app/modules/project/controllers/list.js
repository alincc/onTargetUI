/**
 * Created by thophan on 8/12/2015.
 */
define(function(require) {
  'use strict';
  var angular = require('angular'),
    lodash = require('lodash');
  var controller = ['$scope', '$rootScope', 'userContext', '$state', 'appConstant', 'accountFactory', 'projectFactory', '$modal', 'companyFactory', 'projectContext', 'storage', 'utilFactory', 'userNotificationsFactory', 'notifications',
    function($scope, $rootScope, userContext, $state, appConstant, accountFactory, projectFactory, $modal, companyFactory, projectContext, storage, utilFactory, userNotificationsFactory, notifications) {
      function arrangeData(data, itemPerRow) {
        var list = [];
        var row = [];
        _.forEach(data, function(dt, i) {
          if(i > 0 && i % itemPerRow === 0) {
            list.push(row);
            row = [];
          }
          row.push(dt);
          if(i === data.length - 1 && row.length > 0) {
            list.push(row);
          }
        });
        return list;
      }

      // View mode
      var viewMode = storage.get('projectViewMode');
      if(!viewMode) {
        storage.set('projectViewMode', 'grid');
      }
      $scope.viewMode = viewMode || 'grid';
      $scope.changeMode = function(mode) {
        $scope.viewMode = mode;
        storage.set('projectViewMode', mode);
        var itemPerRow = $scope.viewMode === 'grid' ? 4 : 2;
        $scope.arrangedProjects = arrangeData($scope.projects, itemPerRow);
      };

      $scope.app = appConstant.app;

      $scope.isLoading = false;

      $scope.model = {
        userId: userContext.authentication().userData.userId
      };
      $scope.projects = [];
      $scope.arrangedProjects = [];

      /*$scope.getUserProject = function() {
       $scope.isLoading = true;
       projectFactory.getUserProject({
       userId: userContext.authentication().userData.userId
       }).then(
       function(resp) {
       var itemPerRow = $scope.viewMode === 'grid' ? 6 : 2;
       $scope.projects = $scope.reMapData(resp.data.mainProject.projects);
       $scope.arrangedProjects = arrangeData($scope.projects, itemPerRow);
       $scope.isLoading = false;

       // save projects to local storage
       projectContext.setProject(null, resp.data.projects);
       },
       function() {
       $scope.isLoading = false;
       }
       );
       };*/

      $scope.getUserProjectList = function() {
        $scope.isLoading = true;
        projectFactory.getUserProjectList({
          userId: userContext.authentication().userData.userId
        }).then(
          function(resp) {
            var itemPerRow = $scope.viewMode === 'grid' ? 4 : 2;
            $scope.projects = $scope.reMapData(resp.data.mainProject.projects);
            $scope.arrangedProjects = arrangeData($scope.projects, itemPerRow);
            $scope.isLoading = false;

            // save projects to local storage
            projectContext.setProject(null, resp.data.mainProject);
          },
          function() {
            $scope.isLoading = false;
          }
        );
      };

      var createProjectModalInstance, editProjectModalInstance, deleteProjectModalInstance;

      /*$scope.openCreateProjectModal = function() {
        createProjectModalInstance = $modal.open({
          templateUrl: 'project/templates/create.html',
          controller: 'ProjectCreateController',
          size: 'lg'
        });

        createProjectModalInstance.result.then(function() {
          $scope.getUserProjectList();
        }, function() {

        });
      };

      $scope.editProjectModal = function(project) {
        // prepare company list
        companyFactory.search().success(function(resp) {
          editProjectModalInstance = $modal.open({
            templateUrl: 'project/templates/edit.html',
            controller: 'ProjectEditController',
            size: 'lg',
            resolve: {
              project: function() {
                return project;
              },
              companies: function() {
                return resp.companyList;
              }
            }
          });

          editProjectModalInstance.result.then(function() {
            $scope.getUserProjectList();
          }, function() {

          });
        });
      };*/

      //edit project
      $scope.editProject = function (project){
        $rootScope.editProject = project;
        $state.go('app.editProject');
      };

      $scope.deleteProject = function(project) {
        deleteProjectModalInstance = $modal.open({
          templateUrl: 'project/templates/delete.html',
          controller: 'ProjectDeleteController',
          size: 'lg',
          resolve: {
            project: function() {
              return project;
            }
          }
        });

        deleteProjectModalInstance.result.then(function() {
          $scope.getUserProjectList();
        }, function() {

        });
      };

      $scope.goDashboard = function(pj) {
        console.log(pj);
        projectContext.setProject(pj);
        // get project details
        projectFactory.getProjectById(pj.projectId)
          .success(function(resp) {
            projectContext.setProject(resp.project);

            // get notifications
            if($rootScope.currentUserInfo && $rootScope.currentUserInfo.userId) {
              userNotificationsFactory.getAll({
                "pageNumber": 1,
                "perPageLimit": 5
              }).then(function (resp){
                $rootScope.userNotifications = resp.data;
                notifications.getNotificationSuccess();
              });

              notifications.currentProjectChange({project: pj});

              // get user details and permissions
              accountFactory.getUserProfileDetails($rootScope.currentUserInfo.userId)
                .success(function(resp) {
                  var newObj = angular.copy($rootScope.currentUserInfo);
                  newObj.menuProfile = $rootScope.currentUserInfo.menuProfile = resp.menuList;
                  newObj.permissionProfile = $rootScope.currentUserInfo.permissionProfile = resp.featureList;
                  userContext.fillInfo(newObj, true);
                  $state.go('app.dashboard');
                });
            }
          });
      };

      $scope.reMapData = function(list) {
        return _.map(list, function(el) {
          var newEl = el;
          //newEl.percentage = el.percentageComplete;
          utilFactory.generateAddress(el.projectAddress)
            .then(function(add) {
              newEl.fullAddress1 = add;
            });
          newEl.fullAddress2 = el.address2;
          return newEl;
        });
      };

      //$scope.getUserProject();
      $scope.getUserProjectList();
    }];
  return controller;
});