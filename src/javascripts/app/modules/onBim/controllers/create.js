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
             toaster) {
      $scope.app = appConstant.app;
      $scope.project = {};
      $scope.updateData = {};
      $scope.projectAssetFolderName = $rootScope.currentProjectInfo.projectAssetFolderName;

      $scope.picture = {
        file: null,
        percentage: 0,
        isUploadPicture: false,
        isUploadedPicture: false
      };

      $scope.ifc = {
        file: null,
        isValid: false,
        validate: function(file) {
          if(file && !/\.ifc$/i.test(file.name)) {
            toaster.pop('error', 'File invalid', 'Please select IFC file');
            $scope.ifc.isValid = false;
          } else if(file && /\.ifc$/i.test(file.name)) {
            $scope.ifc.isValid = true;
          }
        }
      };

      $scope.addBimProject = function() {
        if(!$scope.ifc.isValid) {
          return;
        }

        function addProject() {
          onBimFactory.addProject({
            "projectid": $rootScope.currentProjectInfo.projectId,
            "poid": '',
            "projectBimFileLocation": $scope.project.projectBimFileLocation,
            "projectBimFileJSONLocation": '',
            "projectBimFileIFCLocation": '',
            "isIfcFileConversionComplete": 'N',
            "name": $scope.project.name,
            "description": $scope.project.description
          }).success(function(resp) {
            onBimFactory.uploadIfc($scope.ifc.file, $scope.projectAssetFolderName, {
              projectBimFileId: resp.projectBimFileDTO.projectBimFileId,
              baseRequest: {
                "loggedInUserId": $rootScope.currentUserInfo.userId,
                "loggedInUserProjectId": $rootScope.currentProjectInfo.projectId ? $rootScope.currentProjectInfo.projectId : $rootScope.mainProjectInfo.projectId
              }
            })
              .progress(function(evt) {
                // Progress event
              })
              .success(function(ifcInfo, status, headers, config) {
                // Update IFC and JSON file path
                onBimFactory.updateProject({
                  "projectid": $rootScope.currentProjectInfo.projectId,
                  "poid": '',
                  "projectBimFileLocation": resp.projectBimFileDTO.bimThumbnailPath,
                  "projectBimFileJSONLocation": ifcInfo.jsonFile,
                  "projectBimFileIFCLocation": ifcInfo.ifcFile,
                  "isIfcFileConversionComplete": 'N',
                  "name": resp.projectBimFileDTO.name,
                  "description": resp.projectBimFileDTO.description,
                  "projectBimFileId": resp.projectBimFileDTO.projectBimFileId
                })
                  .success(function() {
                    $state.go('app.onBimDetails', {projectId: resp.projectBimFileDTO.projectBimFileId});
                  })
                  .error(function() {
                    console.log('Failed to update project bim');
                  });
              })
              .error(function() {
                console.log('Failed to upload IFC file');
              });
          })
            .error(function() {
              $scope._form.$setPristine();
              $scope.ifc.isValid = false;
            });
        }

        if($scope.picture.isUploadedPicture) {
          fileFactory.move($scope.project.projectBimFileLocation, null, 'projects', $scope.projectAssetFolderName, 'onbim')
            .success(function(resp) {
              $scope.project.projectBimFileLocation = resp.url;
              addProject();
            })
            .error(function() {
              $scope._form.$setPristine();
              $scope.ifc.isValid = false;
            });
        }
        else {
          addProject();
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
              $scope.project.projectBimFileLocation = data.url;
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