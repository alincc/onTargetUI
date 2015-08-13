/**
 * Created by thophan on 8/12/2015.
 */
define(function() {
  'use strict';
  var controller = ['$scope', '$rootScope', 'userContext', '$state', 'appConstant', 'accountFactory', 'projectFactory', '$modal', 'companyFactory', 'projectContext', function($scope, $rootScope, userContext, $state, appConstant, accountFactory, projectFactory, $modal, companyFactory, projectContext) {

    $scope.app = appConstant.app;
    $scope.isLoading = false;

    $scope.model = {
      userId: userContext.authentication().userData.userId
    };

    $scope.projects = [];

    $scope.getUserProject = function() {
      $scope.isLoading = true;
      projectFactory.getUserProject($scope.model).then(
        function(resp) {
          $scope.projects = resp.data.mainProject.projects;
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

    var createProjectModalInstance, editProjectModalInstance;

    $scope.openCreateProjectModal = function() {
      createProjectModalInstance = $modal.open({
        templateUrl: 'project/templates/create.html',
        controller: 'ProjectCreateController',
        size: 'lg'
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
        });
    };

    $scope.deleteProject = function() {

    };

    $scope.goDashboard = function(pj) {
      projectContext.setProject(pj);
      $state.go('app.dashboard');
    };

  }];
  return controller;
});