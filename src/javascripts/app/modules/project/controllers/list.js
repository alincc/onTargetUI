/**
 * Created by thophan on 8/12/2015.
 */
define(function(require) {
  'use strict';
  var angular = require('angular'),
    lodash = require('lodash');
  var controller = ['$scope', '$rootScope', 'userContext', '$state', 'appConstant', 'accountFactory', 'projectFactory', '$modal', 'companyFactory', 'projectContext', 'storage', 'utilFactory', 'userNotificationsFactory', 'notifications', 'permissionFactory', 'toaster',
    function($scope, $rootScope, userContext, $state, appConstant, accountFactory, projectFactory, $modal, companyFactory, projectContext, storage, utilFactory, userNotificationsFactory, notifications, permissionFactory, toaster) {
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
      $scope.isOwner = userContext.authentication().isOwner;

      $scope.getUserProjectList = function() {
        // Clear project context cache
        projectContext.clearInfo();

        $scope.isLoading = true;
        projectFactory.getUserProjectList({
          userId: userContext.authentication().userData.userId
        }).then(function(resp) {
            var itemPerRow = $scope.viewMode === 'grid' ? 4 : 2;
            $scope.projects = $scope.reMapData(resp.data.projects);
            $rootScope.allProjects = resp.data.projects;
            $scope.arrangedProjects = arrangeData($scope.projects, itemPerRow);

          console.log($scope.arrangedProjects);

            $scope.isLoading = false;
          },
          function() {
            $scope.isLoading = false;
          });
      };

      var deleteProjectModalInstance;

      //edit project
      $scope.editProject = function(project) {
        projectContext.setProject(project);
        $state.go('app.editProject',{projectId: project.projectId});
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

        // Get and save project permissions
        accountFactory.getUserProjectProfile(pj.projectId)
          .success(function(resp) {
            userContext.updatePermissions(resp.featureList, resp.menuList);

            if(permissionFactory.checkFeaturePermission('VIEW_DASHBOARD')) {
              // Set and cache project context
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
                    })
                      .then(function(resp) {
                        $rootScope.userNotifications = resp.data;
                        notifications.getNotificationSuccess();
                      });

                    notifications.currentProjectChange({project: pj});

                    $state.go('app.dashboard');
                  }
                });
            }
            else {
              toaster.pop('error','Error','Sorry you dont have permission to access project dashboard');
            }
          })
          .error(function(err) {
            console.log(err);
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



      //search projects
      $scope.projectObject = {
        projectName: ''
      };
    }];
  return controller;
});