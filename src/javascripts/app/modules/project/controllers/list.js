/**
 * Created by thophan on 8/12/2015.
 */
define(function() {
  'use strict';
  var angular = require('angular'),
    lodash = require('lodash');
  var controller = ['$scope', '$rootScope', 'userContext', '$state', 'appConstant', 'accountFactory', 'projectFactory', '$modal', 'companyFactory', 'projectContext', 'storage', 'utilFactory', function($scope, $rootScope, userContext, $state, appConstant, accountFactory, projectFactory, $modal, companyFactory, projectContext, storage, utilFactory) {
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
      var itemPerRow = $scope.viewMode === 'grid' ? 6 : 2;
      $scope.arrangedProjects = arrangeData($scope.projects, itemPerRow);
    };

    $scope.app = appConstant.app;

    $scope.isLoading = false;

    $scope.model = {
      userId: userContext.authentication().userData.userId
    };
    $scope.projects = [];
    $scope.arrangedProjects = [];

    $scope.getUserProject = function() {
      $scope.isLoading = true;
      projectFactory.getUserProject($scope.model).then(
        function(resp) {
          var itemPerRow = $scope.viewMode === 'grid' ? 6 : 2;
          $scope.projects = $scope.reMapData(resp.data.mainProject.projects);
          $scope.arrangedProjects = arrangeData($scope.projects, itemPerRow);
          $scope.isLoading = false;

          // save project to local storage
          projectContext.setProject(null, resp.data.mainProject);
        },
        function() {
          $scope.isLoading = false;
        }
      );
    };

    $scope.getUserProject();

    var createProjectModalInstance, editProjectModalInstance, deleteProjectModalInstance;

    $scope.openCreateProjectModal = function() {
      createProjectModalInstance = $modal.open({
        templateUrl: 'project/templates/create.html',
        controller: 'ProjectCreateController',
        size: 'lg'
      });

      createProjectModalInstance.result.then(function() {
        $scope.getUserProject();
      }, function() {

      });
    };

    $scope.editProjectModal = function(project) {
      // prepare company list
      companyFactory.search()
        .success(function(resp) {
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
            $scope.getUserProject();
          }, function() {

          });
        });
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
        $scope.getUserProject();
      }, function() {

      });
    };

    $scope.goDashboard = function(pj) {
      projectContext.setProject(pj);
      $state.go('app.dashboard');
    };

    $scope.reMapData = function(list) {
      return _.map(list, function(el) {
        var newEl = el;
        var percentage = 50;
        newEl.percentage = percentage;
        //newEl.statusColor =
        //  percentage <= 25 ? 'e25805' :
        //    percentage <= 50 ? 'ffb56d' :
        //      percentage <= 75 ? 'e2df05' :
        //        '55d63c';

        newEl.statusColor = percentage >= 75 ? '55d63c' :
          percentage >= 50 ? 'e2df05' :
            percentage >= 25 ? 'ffb56d' : 'e25805';

        utilFactory.generateAddress(el.projectAddress)
          .then(function(add) {
            newEl.fullAddress1 = add;
          });
        newEl.fullAddress2 = el.address2;
        return newEl;
      });
    };

  }];
  return controller;
});