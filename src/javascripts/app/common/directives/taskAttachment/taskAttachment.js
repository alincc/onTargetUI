define(function (require){
  'use strict';
  var angular = require('angular'),
    tpl = require('text!./templates/taskAttachment.html'),
    viewAttachmentTpl = require('text!./templates/viewAttachment.html'),
    _ = require('lodash'),
    module;
  module = angular.module('common.directives.taskAttachment', []);

  module.run([
    '$templateCache',
    function ($templateCache){
      $templateCache.put('taskAttachment/templates/taskAttachment.html', tpl);
      $templateCache.put('taskAttachment/templates/viewAttachment.html', viewAttachmentTpl);
    }]);

  module.controller('TaskAttachmentViewController', [
    '$scope',
    'attachment',
    '$modalInstance',
    '$sce',
    'utilFactory',
    '$filter',
    function ($scope,
              attachment,
              $modalInstance,
              $sce,
              utilFactory,
              $filter){
      $scope.attachment = attachment;
      $scope.fileExtension = utilFactory.getFileExtension(attachment.location);
      $scope.filePath = $filter('filePath')(attachment.location);
      $scope.isPdf = /(pdf$)/.test($scope.filePath);
      $scope.isImage = /(png|jpg|jpeg|gif)/.test($scope.fileExtension);
      $scope.cancel = function (){
        $modalInstance.dismiss('cancel');
      };

      $scope.trustSrc = function (src){
        return $sce.trustAsResourceUrl(src);
      };
    }]);


  module.controller('deletedTaskAttachmentController', [
    '$scope',
    '$modalInstance',
    'taskFactory',
    'task',
    function ($scope,
              $modalInstance,
              taskFactory,
              task){
      $scope.delete = function (){
        taskFactory.deletedTaskAttachment(task.taskFileId).then(
          function (resp){
            $modalInstance.close({});
          }, function (err){

          });
      };

      $scope.cancel = function (){
        $modalInstance.dismiss('cancel');
      };
    }]);

  module.directive('taskAttachment', [
    '$customScroll',
    function ($customScroll){
      return {
        restrict: 'E',
        scope: {
          task: '=task'
        },
        templateUrl: 'taskAttachment/templates/taskAttachment.html',
        controller: [
          '$scope',
          '$rootScope',
          'taskFactory',
          'fileFactory',
          '$timeout',
          '$window',
          '$filter',
          'toaster',
          '$modal',
          function ($scope,
                    $rootScope,
                    taskFactory,
                    fileFactory,
                    $timeout,
                    $window,
                    $filter,
                    toaster,
                    $modal){

            $scope.attachments = [];
            $scope.isUploading = false;
            $scope.percentage = 0;
            $scope.isLoadingAttachments = false;
            $scope.attachment = {
              file: null
            };
            $scope.model = {
              fileName: '',
              taskId: $scope.task.projectTaskId,
              userId: $rootScope.currentUserInfo.userId,
              location: ''
            };

            $scope.getTaskAttachments = function (){
              $scope.isLoadingAttachments = true;
              taskFactory.getTaskAttachments({taskId: $scope.task.projectTaskId}).then(
                function (resp){
                  $scope.attachments = resp.data.taskAttachments;
                  $scope.isLoadingAttachments = false;
                  $scope.$broadcast("content.reload");
                }, function (err){
                  console.log(err);
                  $scope.isLoadingAttachments = false;
                });
            };

            $scope.upload = function ($files){
              $scope.isUploading = true;
              //$files: an array of files selected, each file has name, size, and type.
              var $file = $files[0];
              fileFactory.upload($file, null, 'projects', $rootScope.currentProjectInfo.projectAssetFolderName, 'task').progress(function (evt){
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                $scope.percentage = progressPercentage;
              }).success(function (data, status, headers, config){
                $timeout(function (){
                  $scope.model.fileName = data.url.substring(data.url.lastIndexOf('/') + 1);
                  $scope.model.location = data.url;
                  $scope.isUploading = false;
                  $scope.saveTaskFile();
                });
              }).error(function (){
                $scope.isUploading = false;
              });
            };

            $scope.download = function (att){
              $window.open($filter('fileDownloadPathHash')(att.location));
            };

            $scope.preview = function (att){
              //$rootScope.fileAttachment = att;
              //$state.go('app.previewDocument', {onAction: 'onTime'});
              if (!/(pdf|png|jpg|jpeg|gif)$/.test(att.fileName)) {
                toaster.pop('error', 'Error', 'Sorry, this file can not be preview!');
                return;
              }

              $modal.open({
                animation: true,
                templateUrl: 'taskAttachment/templates/viewAttachment.html',
                controller: 'TaskAttachmentViewController',
                size: 'lg',
                windowClass: 'width90',
                resolve: {
                  attachment: function (){
                    return att;
                  }
                }
              });
            };

            $scope.saveTaskFile = function (){
              taskFactory.saveTaskFile($scope.model).then(
                function (resp){
                  $scope.attachments.push({
                    "contact": $rootScope.currentUserInfo.contact,
                    "fileName": $scope.model.fileName,
                    "location": $scope.model.location,
                    "taskId": $scope.task.projectTaskId,
                    "userId": $rootScope.currentUserInfo.userInfo
                  });

                  $scope.$broadcast('taskAttachment.addAttachmentSuccessful');
                }, function (err){
                  console.log(err);
                  $scope.$broadcast('taskAttachment.addAttachmentFailed');
                });
            };

            $scope.$watch('attachment.file', function (){
              if ($scope.attachment.file) {
                $scope.upload([$scope.attachment.file]);
              }
            });

            $scope.getTaskAttachments();


            $scope.deleted = function (att){
              var deleteTaskModalInstance = $modal.open({
                templateUrl: 'onTime/task/templates/delete.html',
                controller: 'deletedTaskAttachmentController',
                size: 'sm',
                resolve: {
                  task: function (){
                    return att;
                  }
                }
              });

              deleteTaskModalInstance.result.then(function (){
                _.remove($scope.attachments, function (e){
                  return e.taskFileId === att.taskFileId;
                });
              }, function (){

              });

            };

          }],
        link: function (scope){
          var scroller = $customScroll.get('taskAttachment');
          scope.$on('taskAttachment.addAttachmentSuccessful', function (){
            scroller.updateScroll();
            if (scroller.atBottom) {
              scroller.scrollTo('bottom');
            }
          });

          scope.$on('taskAttachment.addAttachmentFailed', function (){
            console.log(scroller);
          });
        }
      };
    }]);
  return module;
});