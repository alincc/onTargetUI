define(function(require){
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    toaster = require('toaster'),
    fileServiceModule = require('app/common/services/file'),
    projectServiceModule = require('app/common/services/project'),
    utilServiceModule = require('app/common/services/util'),
    module;
  module = angular.module('common.directives.changeProjectImage', ['app.config', 'toaster', 'common.services.file', 'common.services.project', 'common.services.util']);
  module.directive('changeProjectImage', ['$timeout', '$compile', function($timeout, $compile){
    return {
      restrict: 'A',
      controller: ['$scope', 'appConstant', 'toaster', 'fileFactory', 'projectFactory', 'utilFactory', '$rootScope', function($scope, appConstant, toaster, fileFactory, projectFactory, utilFactory, $rootScope){

        function updateProject(){
          // get project by id
          $scope.updateProjectModel = angular.copy($scope.project);
          if(!$scope.updateProjectModel.unitOfMeasurement && angular.isObject($scope.updateProjectModel.projectConfiguration)) {
            $scope.updateProjectModel.unitOfMeasurement = $scope.updateProjectModel.projectConfiguration[0].configValue;
          }

          if(angular.isObject($scope.updateProjectModel.company)) {
            $scope.updateProjectModel.companyId = $scope.updateProjectModel.company.companyId;
          }

          projectFactory.addProject({
            project: $scope.updateProjectModel,
            userId: $rootScope.currentUserInfo.userId,
            accountStatus: $rootScope.currentUserInfo.accountStatus
          }).then(function(resp){
              $scope.isUploadingProjectImage = false;
            }, function(err){
              $scope.isUploadingProjectImage = false;
            }
          );
        }

        function upload(file){
          if($scope.isUploadingProjectImage) {
            return;
          }

          $scope.isUploadingProjectImage = true;

          if(!$scope.project.projectAssetFolderName) {
            $scope.project.projectAssetFolderName = utilFactory.makeId(20);
          }

          fileFactory.upload(file, null, 'projects', $scope.project.projectAssetFolderName, null, true)
            .progress(function(evt){
              var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
              $scope.projectImageModel.percentage = progressPercentage;
            }).success(function(data, status, headers, config){
              $timeout(function(){
                $scope.project.projectImagePath = data.url;
                updateProject();
              });
            })
            .error(function(){
              $scope.isUploadingProjectImage = false;
            });
        }

        $scope.isUploadingProjectImage = false;

        $scope.uploadProjectImage = function(files){
          if(files && files.length) {
            for(var i = 0; i < files.length; i++) {
              upload(files[i]);
            }
          }
        };

        $scope.projectImageModel = {
          file: null,
          percentage: 0,
          projectImagePath: ''
        };

        $scope.$watch('projectImageModel.file', function(){
          if($scope.projectImageModel.file) {
            if(appConstant.app.allowedImageExtension.test($scope.projectImageModel.file.type)) {
              $scope.uploadProjectImage([$scope.projectImageModel.file]);
            }
            else {
              toaster.pop('error', 'Error', 'Only accept jpg, png file');
            }
          }
        });
      }],
      link: function(scope, elem, attrs){
        elem.addClass('change-project-image');

        var $a = elem.children();
        if($a && $a[0].tagName === 'A') {
          var html = '<div class="overlay"><p>Change Image</p></div>';
          $a.prepend(html);
          $a.attr('ngf-select', '');
          $a.attr('ng-model', 'projectImageModel.file');
          $a.attr('ngf-multiple', 'false');

          // Recompile the element to apply ng-file-upload
          $compile($a)(scope);
        }
      }
    };
  }]);
  return module;
});