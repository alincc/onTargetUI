define(function(require) {
  'use strict';
  var angular = require('angular'),
    lodash = require('lodash');
  var controller = ['$scope', '$rootScope', '$q', '$location', 'appConstant', '$filter', '$window', '$state', 'onBimFactory', '$modal', 'toaster',
    function($scope, $rootScope, $q, $location, appConstant, $filter, $window, $state, onBimFactory, $modal, toaster) {
      $scope.app = appConstant.app;
      $scope.bimProjects = [];
      $scope.projects = [];

      $scope.getProjectList = function() {
        $scope.onLoading = true;
        onBimFactory.getAllProjects($rootScope.currentProjectInfo.projectId).then(
          function(resp) {
            $scope.projectList = resp.poids;
            if($scope.projectList && $scope.projectList.length > 0) {
              var promises = [];
              _.each($scope.projectList, function(project) {
                promises.push(getProjectByPoid(project.poid).then(
                  function(resp) {
                    project.bim = resp;
                  }
                ));
              });

              $q.all(promises).then(
                function(values) {
                  $scope.onLoading = false;
                }, function(errors) {
                  $scope.onLoading = false;
                  console.log(errors);
                });
            } else {
              $scope.onLoading = false;
            }
          }, function (err){
            console.log(err.message);
            $scope.onLoading = false;
            if(err.message === 'Unexpected token U') {
              toaster.pop('error', "Permission denied", "You have no permission to access this. Please contact your administrator");
            }
          }
        );
      };

      var getProjectByPoid = function(poid) {
        var deferred = $q.defer();
        onBimFactory.getBimProjectByPoid(poid).success(
          function(resp) {
            //$scope.bimProjects.push(resp.response.result);
            deferred.resolve(resp.response.result);
          }
        ).error(function(error) {
            deferred.reject(error);
          });
        return deferred.promise;
      };

      $scope.projectDetail = function(project) {
        //$state.go('app.bimProject.project', {poid: project.poid});
        var onTargetProject = _.find($scope.projectList, {poid: project.poid});
        if(onTargetProject) {
          $state.go('app.bimProject.project', {
            poid: project.poid,
            projectBimFileId: onTargetProject.projectBimFileId
          });
        } else {
          alert('BIM project not found');
        }
      };

      $scope.getProjectList();

      var deleteProjectModalInstance;
      $scope.deleteProject = function(project) {
        var onTargetProject = _.find($scope.projectList, {poid: project.poid});
        if(!onTargetProject) {
          return;
        }
        deleteProjectModalInstance = $modal.open({
          templateUrl: 'bimProject/templates/delete.html',
          controller: 'BimProjectDeleteController',
          size: 'sm',
          resolve: {
            project: function() {
              return onTargetProject;
            }
          }
        });

        deleteProjectModalInstance.result.then(function() {
          $scope.getProjectList();
        }, function() {

        });
      };

      $scope.editProject = function (project){
        $rootScope.currentBimProject = project;
        $state.go('app.bimProject.updateProject', {poid: project.poid, projectBimFileId: project.projectBimFileId});
      };
    }
  ];

  return controller;
});