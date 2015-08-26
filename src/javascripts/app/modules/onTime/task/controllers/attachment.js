/**
 * Created by thophan on 8/21/2015.
 */
define(function(require) {

  'use strict';
  var angular = require('angular'),
    lodash = require('lodash');

  var controller = ['$scope', '$rootScope', 'countryFactory', 'projectFactory', 'userContext', 'projectContext', 'activityFactory', 'toaster', 'taskFactory', 'notifications', 'uploadFactory', '$timeout',
    function($scope, $rootScope, countryFactory, projectFactory, userContext, projectContext, activityFactory, toaster, taskFactory, notifications, uploadFactory, $timeout) {
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
        userId: userContext.authentication().userData.userId
      };

      $scope.getTaskAttachments = function() {
        $scope.isLoadingAttachments = true;
        taskFactory.getTaskAttachments({taskId: $rootScope.currentTask.projectTaskId}).then(
          function(resp) {
            $scope.attachments = resp.data.taskAttachments;
            $scope.isLoadingAttachments = false;
          }, function(err) {
            console.log(err);
            $scope.isLoadingAttachments = false;
          });
      };

      $scope.upload = function($files) {
        $scope.isUploading = true;
        //$files: an array of files selected, each file has name, size, and type.
        var $file = $files[0];
        uploadFactory.upload($file).progress(function(evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          $scope.percentage = progressPercentage;
        }).success(function(data, status, headers, config) {
          $timeout(function() {
            $scope.model.fileName = data.url;
            $scope.isUploading = false;
            $scope.saveTaskFile();
          });
        }).error(function() {
          $scope.isUploading = false;
        });
      };

      $scope.saveTaskFile = function() {
        taskFactory.saveTaskFile($scope.model).then(
          function(resp) {
          });
      };

      $scope.$watch('attachment.file', function() {
        if($scope.attachment.file) {
          $scope.upload([$scope.attachment.file]);
        }
      });

      $scope.getTaskAttachments();

    }];
  return controller;
});