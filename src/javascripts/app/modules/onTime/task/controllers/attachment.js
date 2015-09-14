/**
 * Created by thophan on 8/21/2015.
 */
define(function(require) {

  'use strict';
  var angular = require('angular'),
    lodash = require('lodash');

  var controller = ['$scope', '$rootScope', 'countryFactory', 'projectFactory', 'userContext', 'projectContext', 'activityFactory', 'toaster', 'taskFactory', 'notifications', 'fileFactory', '$timeout', '$filter',
    function($scope, $rootScope, countryFactory, projectFactory, userContext, projectContext, activityFactory, toaster, taskFactory, notifications, fileFactory, $timeout, $filter) {
      $scope.attachments = [];
      $scope.isUploading = false;
      $scope.percentage = 0;
      $scope.isLoadingAttachments = false;
      $scope.attachment = {
        file: null
      };
      $scope.model = {
        fileName: '',
        taskId: $rootScope.currentTask.projectTaskId,
        userId: userContext.authentication().userData.userId,
        location: ''
      };

      $scope.getTaskAttachments = function() {
        $scope.isLoadingAttachments = true;
        taskFactory.getTaskAttachments({taskId: $rootScope.currentTask.projectTaskId}).then(
          function(resp) {
            $scope.attachments = resp.data.taskAttachments;
            $scope.isLoadingAttachments = false;
            $scope.$broadcast("content.reload");
          }, function(err) {
            console.log(err);
            $scope.isLoadingAttachments = false;
          });
      };

      $scope.upload = function($files) {
        $scope.isUploading = true;
        //$files: an array of files selected, each file has name, size, and type.
        var $file = $files[0];
        fileFactory.upload($file, null, 'projects', $rootScope.currentProjectInfo.projectAssetFolderName, 'task').progress(function(evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          $scope.percentage = progressPercentage;
        }).success(function(data, status, headers, config) {
          $timeout(function() {
            $scope.model.fileName = data.url;
            $scope.model.location = data.url;
            $scope.isUploading = false;
            $scope.saveTaskFile();
          });
        }).error(function() {
          $scope.isUploading = false;
        });
      };

      $scope.download = function(att){
        window.open($filter('filePath')(att.fileName));
      };

      $scope.saveTaskFile = function() {
        taskFactory.saveTaskFile($scope.model).then(
          function(resp) {
            $scope.attachments.push({
              "contact" : $rootScope.currentUserInfo.contact,
              "fileName" : $scope.model.fileName,
              "location" : $scope.model.location,
              "taskId" : $rootScope.currentTask.projectTaskId,
              "userId" : $rootScope.currentUserInfo.userInfo
            });

            $scope.$broadcast("content.reload");
          });
      };

      $scope.$watch('attachment.file', function() {
        if($scope.attachment.file) {
          $scope.upload([$scope.attachment.file]);
        }
      });

      $scope.getTaskAttachments();

      /*$scope.uploadFile = function(upload) {
       var file = upload.files[0];
       $scope.isUploadAvatar = true;
       fileFactory.upload(file, 'task').progress(function (evt) {
       var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
       //$scope.log = 'progress: ' + progressPercentage + '% ' +
       //  evt.config.file.name + '\n' + $scope.log;
       $scope.percentage = progressPercentage;
       }).success(function (data, status, headers, config) {
       $timeout(function () {
       console.log(data);
       $scope.model.fileName = file.name;
       taskFactory.saveTaskFile($scope.model).then(
       function (resp) {
       uploadSuccess();
       //toaster.pop("success", "Success", resp.data.returnMessage);
       });
       $scope.isUploadAvatar = false;
       });
       })
       .error(function () {
       $scope.isUploadAvatar = false;
       });
       };*/
    }];
  return controller;
});