/**
 * Created by thophan on 8/20/2015.
 */
define(function() {
  'use strict';
  var controller = ['$scope', '$rootScope', 'countryFactory', 'projectFactory', 'userContext', 'projectContext', 'activityFactory', 'toaster', 'taskFactory', 'notifications',
    function($scope, $rootScope, countryFactory, projectFactory, userContext, projectContext, activityFactory, toaster, taskFactory, notifications) {
      $scope.task = $rootScope.currentTask;
      //$scope.assignees = $scope.task.assignee;
      $scope.onAddOwner = false;
      $scope.contacts = [];
      $scope.assignees = [];

      $scope.model = {
        taskId: $scope.task.projectTaskId,
        projectId: $rootScope.activitySelected.projectId,
        members: []
      };

      _.forEach($scope.task.assignee, function(assignee) {
        $scope.assignees.push(assignee.contact);
        $scope.model.members.push(assignee.contact.contactId);
      });

      $scope.getContacts = function() {
        taskFactory.getContacts({projectId: $rootScope.currentProjectInfo.projectId}).then(
          function(resp) {
            var memberList = resp.data.projectMemberList;
            _.forEach(memberList, function(assignee) {
              if(_.findIndex($scope.assignees, 'contactId', assignee.contact.contactId) < 0) {
                $scope.contacts.push(assignee.contact);
              }
            });
            // _.difference($scope.contacts, $scope.assignees);
          }
        );
      };

      $scope.getContacts();

      $scope.addOwner = function() {
        $scope.onAddOwner = true;
      };

      $scope.updateTask = function() {
        var newAssigness = [];
        _.each($scope.assignees, function(el) {
          newAssigness.push({contact: el});
        });
        notifications.taskUpdated({
          projectTaskId: $rootScope.currentTask.projectTaskId,
          task: {
            assignee: newAssigness
          }
        });
      };

      $scope.removeUserFromTask = function(assignee) {
        $scope.onAddOwner = false;
        _.remove($scope.model.members, function(n) {
          return n === assignee.contactId;
        });
        taskFactory.assignUserToTask($scope.model).then(
          function(resp) {
            _.remove($scope.assignees, function(n) {
              return n === assignee;
            });
            $scope.contacts.push(assignee);
            $scope.updateTask();
          }
        );
      };

      $scope.assignUserToTask = function() {
        $scope.model.members.push($scope.assignee.contactId);
        taskFactory.assignUserToTask($scope.model).then(
          function(resp) {
            $scope.assignees.push($scope.assignee);
            _.remove($scope.contacts, function(n) {
              return n === $scope.assignee;
            });
            $scope.assignee = '';
            $scope.onAddOwner = false;
            $scope.updateTask();
          }
        );
      };
    }];
  return controller;
});