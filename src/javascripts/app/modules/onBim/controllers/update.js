define(function(require) {
  'use strict';
  var angular = require('angular');
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
    'fileFactory',
    '$timeout',
    'toaster',
    'project',
    '$stateParams',
    function($scope,
             $rootScope,
             $q,
             $location,
             appConstant,
             $filter,
             $window,
             $state,
             onBimFactory,
             fileFactory,
             $timeout,
             toaster,
             project,
             $stateParams) {
      $scope.app = appConstant.app;
      $scope.project = project;
      $scope.project.projectBimFileLocation = $scope.project.bimThumbnailPath;
      $scope.updateData = {};
      $scope.projectAssetFolderName = $rootScope.currentProjectInfo.projectAssetFolderName;

      $scope.picture = {
        file: null,
        percentage: 0,
        isUploadPicture: false,
        isUploadedPicture: false
      };

      $scope.ifc = {
        isValid: true
      };

      $scope.updateBimProject = function() {
        if(!$scope.ifc.isValid) {
          return;
        }

        function update() {
          onBimFactory.updateProject({
            "projectid": $rootScope.currentProjectInfo.projectId,
            "poid": '',
            "projectBimFileLocation": $scope.project.projectBimFileLocation,
            "projectBimFileJSONLocation": $scope.project.bimProjectJSONFilePath,
            "projectBimFileIFCLocation": $scope.project.bimProjectIFCFilePath,
            "isIfcFileConversionComplete": $scope.project.isBimIFCConversionComplete,
            "name": $scope.project.name,
            "description": $scope.project.description,
            "projectBimFileId": parseInt($stateParams.projectId)
          })
            .success(function(resp) {
              $state.go('app.onBim');
            });
        }

        if($scope.picture.isUploadedPicture) {
          fileFactory.move($filter('filePath')($scope.project.projectBimFileLocation, 'relative'), null, 'projects', $scope.projectAssetFolderName, 'onbim')
            .success(function(resp) {
              $scope.project.projectBimFileLocation = resp.url;
              update();
            }
          );
        } else {
          update();
        }
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
              $scope.project.projectBimFileLocation = $filter('filePath')(data.url, 'node');
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
    }
  ];
  return controller;
});