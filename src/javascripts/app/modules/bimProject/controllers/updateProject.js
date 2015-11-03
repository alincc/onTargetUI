define(function(require){
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', '$q', '$location', 'appConstant', '$filter', '$window', '$state', 'onBimFactory', 'fileFactory', '$timeout', 'toaster', 'project', '$stateParams', 'utilFactory',
    function($scope, $rootScope, $q, $location, appConstant, $filter, $window, $state, onBimFactory, fileFactory, $timeout, toaster, project, $stateParams, utilFactory){
      $scope.app = appConstant.app;
      $scope.project = {};
      $scope.updateData = {};
      $scope.oid = '';
      $scope.project = project;
      $scope.projectAssetFolderName = utilFactory.makeId(20);
      if($rootScope.currentBimProject) {
        $scope.projectBimFileLocation = $rootScope.currentBimProject.bimThumbnailPath;
      }


      $scope.picture = {
        file: null,
        percentage: 0,
        isUploadPicture: false,
        isUploadedPicture: false
      };

      var load = function (){
        $scope.uniformLengthMeasure = onBimFactory.getUniformLengthMeasure();
        $scope.schema = onBimFactory.getSchema();
      };

      $scope.updateBimProject = function (){
        onBimFactory.updateBimProject($scope.project).success(
          function (resp){
            if($scope.picture.isUploadedPicture) {
              fileFactory.move($scope.projectBimFileLocation, null, 'projects', $scope.projectAssetFolderName, 'onbim').success(
                function (resp){
                  $scope.projectBimFileLocation = resp.url;

                  onBimFactory.updateBimThumbnail($stateParams.projectBimFileId, $scope.projectBimFileLocation).success(
                    function (resp){
                      $state.go('app.bimProject.listProject');
                    }
                  );
                }
              );
            }
          }
        );
      };

      $scope.$watch('picture.file', function() {
        if($scope.picture.file) {
          if(appConstant.app.allowedImageExtension.test($scope.picture.file.type)) {
            $scope.upload([$scope.picture.file]);
          }
          else {
            toaster.pop('error', 'Error', 'Only accept jpg, png file');
          }
        }
      });

      function upload(file) {
        $scope.picture.isUploadPicture = true;
        fileFactory.upload(file, null, 'temp', null, null, true)
          .progress(function(evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            $scope.picture.percentage = progressPercentage;
          }).success(function(data, status, headers, config) {
            $timeout(function() {
              $scope.projectBimFileLocation = data.url;
              $scope.picture.isUploadPicture = false;
              $scope.picture.isUploadedPicture = true;
            });
          })
          .error(function() {
            $scope.picture.isUploadPicture = false;
          });
      }

      $scope.upload = function(files) {
        if(files && files.length) {
          for(var i = 0; i < files.length; i++) {
            upload(files[i]);
          }
        }
      };

      load();
    }
  ];
  return controller;
});