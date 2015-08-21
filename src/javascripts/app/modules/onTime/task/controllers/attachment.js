/**
 * Created by thophan on 8/21/2015.
 */
/**
 * Created by thophan on 8/20/2015.
 */
define(function (require){
  'use strict';
  var angular = require('angular'),
    lodash = require('lodash');

  var controller = ['$scope', '$rootScope', 'countryFactory', 'projectFactory', 'userContext', 'projectContext', 'activityFactory', 'toaster', 'taskFactory', 'notifications', 'uploadFile', '$timeout',
    function ($scope, $rootScope, countryFactory, projectFactory, userContext, projectContext, activityFactory, toaster, taskFactory, notifications, uploadFile, $timeout){


      $scope.attachments = [];
      $scope.model = {
        fileName: "",
        location: "/assets/task/",
        taskId: $rootScope.currentTask.projectTaskId,
        userId: userContext.authentication().userData.userId
      };

      $scope.getTaskAttachments = function (){
        taskFactory.getTaskAttachments({taskId: $rootScope.currentTask.projectTaskId}).then(
          function (resp){
            $scope.attachments = resp.data.taskAttachments;
            console.log($scope.attachments);
          }
        );
      };

      $scope.getTaskAttachments();

      $scope.onFileSelect = function ($files){
        //$files: an array of files selected, each file has name, size, and type.
        var $file = $files[0];
        uploadFile.upload($file).progress(function (evt){

        }).success(function (data, status, headers, config){
          $timeout(function (){
            $scope.model.fileName = data.imageName;
          });
        }).error(function (){

          });
      };

      $scope.saveTaskFile = function (){
        taskFactory.saveTaskFile($scope.model).then(
          function (resp){

        });
      };
    }];
  return controller;
});