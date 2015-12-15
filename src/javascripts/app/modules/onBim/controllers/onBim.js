define(function() {
  'use strict';

  var controller = [
    '$scope',
    '$rootScope',
    '$q',
    '$location',
    'appConstant',
    '$filter',
    '$window',
    '$state',
    'onBimFactory',
    '$modal',
    function($scope,
             $rootScope,
             $q,
             $location,
             appConstant,
             $filter,
             $window,
             $state,
             onBimFactory,
             $modal) {
      var deleteProjectModalInstance;

      $scope.app = appConstant.app;
      $scope.bimProjects = [];
      $scope.projects = [];

      $scope.getProjectList = function() {
        $scope.onLoading = true;
        onBimFactory.getAllProjects($rootScope.currentProjectInfo.projectId)
          .then(function(resp) {
            $scope.projectList = resp.data.bimProjects;
            $scope.onLoading = false;
          }, function(err) {
            console.log(err.message);
            $scope.onLoading = false;
          }
        );
      };

      $scope.projectDetail = function(project) {
        $state.transitionTo('app.onBimDetails', {projectId: project.projectBimFileId});
      };

      $scope.deleteProject = function(project) {
        deleteProjectModalInstance = $modal.open({
          templateUrl: 'onBim/templates/delete.html',
          controller: 'onBimDeleteController',
          size: 'sm',
          resolve: {
            project: function() {
              return project;
            }
          }
        });

        deleteProjectModalInstance.result.then(function() {
          $scope.getProjectList();
        }, function() {

        });
      };

      $scope.editProject = function(project) {
        $state.go('app.onBimUpdate', {projectId: project.projectBimFileId});
      };

      $scope.getProjectList();
    }
  ];

  return controller;
});