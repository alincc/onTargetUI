define(function(require){
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', '$q', '$location', 'appConstant', '$filter', '$window', '$state', 'onBimFactory', 'fileFactory', '$timeout', 'toaster', 'utilFactory',
    function($scope, $rootScope, $q, $location, appConstant, $filter, $window, $state, onBimFactory, fileFactory, $timeout, toaster, utilFactory){
      $scope.app = appConstant.app;
      $scope.project = {
        schema: 'ifc2x3tc1'
      };
      $scope.updateData = {};
      $scope.oid = '';
      $scope.projectAssetFolderName = $rootScope.currentProjectInfo.projectAssetFolderName;

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

      $scope.addBimProject = function () {
        if ($scope.picture.isUploadedPicture) {          
          fileFactory.move($filter('filePath')($scope.project.projectBimFileLocation, 'relative'), null, 'projects', $scope.projectAssetFolderName, 'onbim')
            .success(function (resp) {
              $scope.project.projectBimFileLocation = resp.url;
              onBimFactory.addBimProject($scope.project.projectName, $scope.project.schema)
                .success(function (resp) {
                  if (!resp.response.exception) {
                    var updateData = resp.response.result;
                    $scope.oid = updateData.oid;
                    updateData.description = $scope.project.description;
                    updateData.exportLengthMeasurePrefix = $scope.project.exportLengthMeasurePrefix;
                    onBimFactory.updateBimProject(updateData).success(
                      function (resp) {
                        onBimFactory.addProject($rootScope.currentProjectInfo.projectId, $scope.oid, $scope.project.projectBimFileLocation)
                          .success(function (resp) {
                            $scope._form.$setPristine();
                            $state.go('app.bimProject.project', { poid: $scope.oid });
                          });
                      });
                  }
                });
            });
        } else {
          onBimFactory.addBimProject($scope.project.projectName, $scope.project.schema)
            .success(function (resp) {
              if (!resp.response.exception) {
                var updateData = resp.response.result;
                $scope.oid = updateData.oid;
                updateData.description = $scope.project.description;
                updateData.exportLengthMeasurePrefix = $scope.project.exportLengthMeasurePrefix;
                onBimFactory.updateBimProject(updateData).success(
                  function (resp) {
                    onBimFactory.addProject($rootScope.currentProjectInfo.projectId, $scope.oid, $scope.project.projectBimFileLocation).success(function (resp) {
                      $scope._form.$setPristine();
                      $state.go('app.bimProject.project', { poid: $scope.oid });
                    });
                  });
              }
            });
        }

        // onBimFactory.addBimProject($scope.project.projectName, $scope.project.schema)
        //   .success(function (resp) {
        //     if (!resp.response.exception) {
        //       var updateData = resp.response.result;
        //       $scope.oid = updateData.oid;
        //       updateData.description = $scope.project.description;
        //       updateData.exportLengthMeasurePrefix = $scope.project.exportLengthMeasurePrefix;
        //       onBimFactory.updateBimProject(updateData).success(
        //         function (resp) {
        //           if ($scope.picture.isUploadedPicture) {
        //             fileFactory.move($filter('filePath')($scope.project.projectBimFileLocation, 'relative'), null, 'projects', $scope.projectAssetFolderName, 'onbim').success(
        //               function (resp) {
        //                 $scope.project.projectBimFileLocation = resp.url;

        //                 onBimFactory.addProject($rootScope.currentProjectInfo.projectId, $scope.oid, $scope.project.projectBimFileLocation).success(function (resp) {
        //                   //update thumbnail path
        //                   $scope._form.$setPristine();
        //                   $state.go('app.bimProject.project', { poid: $scope.oid });
        //                   ///$state.go('app.bimProject.listProject');
        //                 });
        //               }
        //               ).finally(
        //                 function () {
        //                   $scope._form.$setPristine();
        //                 }
        //                 );
        //           } else {
        //             onBimFactory.addProject($rootScope.currentProjectInfo.projectId, $scope.oid, $scope.project.projectBimFileLocation).success(function (resp) {
        //               //update thumbnail path
        //               $scope._form.$setPristine();
        //               $state.go('app.bimProject.project', { poid: $scope.oid });
        //               ///$state.go('app.bimProject.listProject');
        //             });
        //           }
        //         }
        //         );
        //     } else {
        //       toaster.pop('error', 'Error', resp.response.exception.message);
        //       $scope._form.$setPristine();
        //     }
        //   });
      };

      $scope.$watch('picture.file', function () {
        if ($scope.picture.file) {
          if (appConstant.app.allowedImageExtension.test($scope.picture.file.type)) {
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
          .progress(function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            $scope.picture.percentage = progressPercentage;
          }).success(function (data, status, headers, config) {
            $timeout(function () {
              $scope.project.projectBimFileLocation = $filter('filePath')(data.url, 'node');
              $scope.picture.isUploadPicture = false;
              $scope.picture.isUploadedPicture = true;
            });
          })
          .error(function () {
            $scope.picture.isUploadPicture = false;
          });
      }

      $scope.upload = function (files) {
        if (files && files.length) {
          for (var i = 0; i < files.length; i++) {
            upload(files[i]);
          }
        }
      };

      load();
    }
  ];
  return controller;
});