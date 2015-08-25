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
      $scope.model = {
        fileName: '',
        location: "/assets/task/",
        taskId: $rootScope.currentTask.projectTaskId,
        userId: userContext.authentication().userData.userId
      };

      $scope.getTaskAttachments = function() {
        taskFactory.getTaskAttachments({taskId: $rootScope.currentTask.projectTaskId}).then(
          function(resp) {
            $scope.attachments = resp.data.taskAttachments;
          });
      };

      $scope.getTaskAttachments();

      $scope.onFileSelect = function($files) {
        //$files: an array of files selected, each file has name, size, and type.
        var $file = $files[0];
        uploadFactory.upload($file, 'task').progress(function(evt) {

        }).success(function(data, status, headers, config) {
          $timeout(function() {
            $scope.model.fileName = data.imageName;
          });
        }).error(function() {

        });
      };

      $scope.saveTaskFile = function(){
        taskFactory.saveTaskFile($scope.model).then(
          function (resp){});
      };

      var uploadSuccess = function (){
        var obj = $scope.model;
        obj.contact = userContext.authentication().userData.contact;
        $scope.attachments.push(obj);
      };


      $scope.uploadFile = function(upload) {
        var file = upload.files[0];
        $scope.isUploadAvatar = true;
          uploadFactory.upload(file, 'task').progress(function (evt) {
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
                  toaster.pop("success", "Success", resp.data.returnMessage);
                });
            $scope.isUploadAvatar = false;
          });
        })
            .error(function () {
              $scope.isUploadAvatar = false;
            });
      };
    }];
  return controller;
});