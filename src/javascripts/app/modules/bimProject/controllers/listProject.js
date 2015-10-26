define(function(require) {
  'use strict';
  var angular = require('angular'),
    lodash = require('lodash');
  var controller = ['$scope', '$rootScope', '$q', '$location', 'appConstant', '$filter', '$window', '$state', 'onBimFactory',
    function($scope, $rootScope, $q, $location, appConstant, $filter, $window, $state, onBimFactory) {
      $scope.app = appConstant.app;
      $scope.bimProjects = [];

      $scope.getProjectList = function() {
        onBimFactory.getAllProjects($rootScope.currentProjectInfo.projectId).success(
          function(resp) {
            $scope.projectList = resp.poids;
            if($scope.projectList && $scope.projectList.length > 0) {
              var promises = [];
              _.each($scope.projectList, function(project) {
                promises.push(getProjectByPoid(project.poid));
              });

              $q.all(promises).then(
                function(values) {
                  $scope.onLoading = false;
                  console.log($scope.bimProjects);
                }, function(errors) {
                  $scope.onLoading = false;
                  console.log(errors);
                });

            }
          }
        );

        /*onBimFactory.getBimProjectList().success(
         function (resp){
         console.log(resp);
         $scope.projectList = resp.response.result;
         }
         );*/
      };

      var getProjectByPoid = function(poid) {
        var deferred = $q.defer();
        onBimFactory.getBimProjectByPoid(poid).success(
          function(resp) {
            $scope.bimProjects.push(resp.response.result);
            deferred.resolve();
          }
        ).error(function(error) {
            deferred.reject();
          });
        return deferred.promise;
      };

      $scope.projectDetail = function(project) {
        console.log(project);
        //$state.go('app.bimProject.project', {poid: project.poid});
        var onTargetProject = _.find($scope.projectList, {poid: project.oid});
        if(onTargetProject) {
          $state.go('app.bimProject.project', {
            poid: project.oid,
            projectBimFileId: onTargetProject.projectBimFileId
          });
        } else {
          alert('BIM project not found');
        }

      };

      $scope.getProjectList();
    }
  ];

  return controller;
});