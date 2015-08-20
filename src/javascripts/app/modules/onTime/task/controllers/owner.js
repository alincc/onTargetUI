/**
 * Created by thophan on 8/20/2015.
 */
define(function (){
  'use strict';
  var controller = ['$scope', '$rootScope', 'countryFactory', 'projectFactory', 'userContext', 'projectContext', 'activityFactory', 'toaster', 'taskFactory', 'notifications',
    function ($scope, $rootScope, countryFactory, projectFactory, userContext, projectContext, activityFactory, toaster, taskFactory, notifications){
      $scope.task = $rootScope.currentTask;
      $scope.assignees = $scope.task.assignee;
      $scope.onAddOwner = false;
      $scope.contacts = [];

      taskFactory.getContacts({projectId:$rootScope.currentProjectInfo.projectId}).then(
        function (resp){
          $scope.contacts = resp.data.projectMemberList;
          console.log($scope.contacts);
        }
      );
      $scope.addOwner = function(){
        $scope.onAddOwner = true;
        console.log($scope.onAddOwner);
      };

      $scope.model = {
        taskId : $scope.task.projectTaskId,
        projectId : $rootScope.activitySelected.projectId,
        members : []
      };

      $scope.assignUserToTask = function (){
        taskFactory.assignUserToTask($scope.model).then(
          function (resp){
            toaster.pop('success', 'Success', resp.data.returnMessage);
          }
        );
      };
    }];
  return controller;
});