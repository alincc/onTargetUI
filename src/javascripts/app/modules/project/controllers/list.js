/**
 * Created by thophan on 8/12/2015.
 */
define(function (){
  'use strict';
  var controller = ['$scope', '$rootScope', 'userContext', '$state', 'appConstant', 'accountFactory', 'projectFactory', '$modal', 'companyFactory', 'projectContext', 'storage', function ($scope, $rootScope, userContext, $state, appConstant, accountFactory, projectFactory, $modal, companyFactory, projectContext, storage){

    function arrangeData(data, itemPerRow){
      var list = [];
      var row = [];
      _.forEach(data, function (dt, i){
        if (i > 0 && i % itemPerRow === 0) {
          list.push(row);
          row = [];
        }
        row.push(dt);
        if (i === data.length - 1 && row.length > 0) {
          list.push(row);
        }
      });
      return list;
    }

    // View mode
    var viewMode = storage.get('projectViewMode');
    if (!viewMode) {
      storage.set('projectViewMode', 'grid');
    }
    $scope.viewMode = viewMode || 'grid';
    $scope.changeMode = function (mode){
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

    $scope.getUserProject = function (){
      $scope.isLoading = true;
      projectFactory.getUserProject($scope.model).then(
        function (resp){
          var itemPerRow = $scope.viewMode === 'grid' ? 4 : 2;
          $scope.projects = resp.data.mainProject.projects;
          $scope.arrangedProjects = arrangeData($scope.projects, itemPerRow);
          $scope.isLoading = false;

          // save project to local storage
          projectContext.setProject(null, resp.data.mainProject);

        },
        function (){
          $scope.isLoading = false;
        }
      );
    };

    $scope.getUserProject();

    var createProjectModalInstance, editProjectModalInstance, deleteProjectModalInstance;

    $scope.openCreateProjectModal = function (){
      createProjectModalInstance = $modal.open({
        templateUrl: 'project/templates/create.html',
        controller: 'ProjectCreateController',
        size: 'lg'
      });

      createProjectModalInstance.result.then(function () {
        $scope.getUserProject();
      }, function () {

      });
    };

    $scope.editProjectModal = function (project){
      // prepare company list
      companyFactory.search()
        .success(function (resp){
          editProjectModalInstance = $modal.open({
            templateUrl: 'project/templates/edit.html',
            controller: 'ProjectEditController',
            size: 'lg',
            resolve: {
              project: function (){
                return project;
              },
              companies: function (){
                return resp.companyList;
              }
            }
          });

          editProjectModalInstance.result.then(function () {
            $scope.getUserProject();
          }, function () {

          });
        });
    };

    $scope.deleteProject = function (project){
      deleteProjectModalInstance = $modal.open({
        templateUrl: 'project/templates/delete.html',
        controller: 'ProjectDeleteController',
        size: 'lg',
        resolve: {
          project: function (){
            return project;
          }
        }
      });

      deleteProjectModalInstance.result.then(function () {
        $scope.getUserProject();
      }, function () {

      });
    };

    $scope.goDashboard = function (pj){
      projectContext.setProject(pj);
      $state.go('app.dashboard');
    };

  }];
  return controller;
});