/**
 * Created by thophan on 8/20/2015.
 */
define(function() {
  'use strict';
  var controller = ['$scope', '$rootScope', 'countryFactory', 'projectFactory', 'userContext', 'projectContext', 'activityFactory', 'toaster', 'taskFactory', 'notifications', 'userNotificationsFactory', 'appConstant',
    function($scope, $rootScope, countryFactory, projectFactory, userContext, projectContext, activityFactory, toaster, taskFactory, notifications, userNotificationsFactory, appConstant) {
      $scope.task = $rootScope.currentTask;
      $scope.onAddOwner = false;
      $scope.contacts = [];
      $scope.isAddOwner = false;

      $scope.model = {
        selectedAssignee: null,
        taskId: $scope.task.projectTaskId,
        projectId: $rootScope.activitySelected.projectId,
        assignees: $scope.task.assignee
      };

      console.log($scope.task);

      $scope.getContacts = function() {
        taskFactory.getContacts($rootScope.currentProjectInfo.projectId).then(
          function(resp) {
            $scope.contacts = _.filter(resp.data.projectMemberList, function(el) {
              return _.findIndex($scope.model.assignees, {userId: el.userId}) < 0;
            });
            console.log(resp.data.projectMemberList, $scope.task.assignee, $scope.contacts);
          }
        );
      };

      $scope.addOwner = function() {
        $scope.onAddOwner = true;
      };

      $scope.updateTask = function() {
        notifications.taskUpdated({
          projectTaskId: $rootScope.currentTask.projectTaskId,
          task: {
            assignee: _.map($scope.model.assignees, function(el) {
              return {contact: el.contact};
            })
          }
        });
      };

      var getAllNotifications = function (){
        //userNotificationsFactory.getAll({
        //  "pageNumber": 1,
        //  "perPageLimit": appConstant.app.settings.userNotificationsPageSize
        //}).then(function (resp){
        //  $rootScope.userNotifications = resp.data;
        //  notifications.getNotificationSuccess();
        //});
      };

      $scope.removeUserFromTask = function(assignee) {
        $scope.onAddOwner = false;
        _.remove($scope.model.assignees, function(n) {
          return n.userId === assignee.userId;
        });
        $scope.contacts.push(assignee);
        taskFactory.assignUserToTask({
          taskId: $scope.task.projectTaskId,
          projectId: $rootScope.activitySelected.projectId,
          members: _.map($scope.model.assignees, function(el) {
            return el.userId;
          }),
          ownerId: assignee.userId
        }).then(function(resp) {
          $scope.model.selectedAssignee = null;
          $scope.updateTask();

          getAllNotifications();
        });
      };

      $scope.assignUserToTask = function() {
        $scope.onAddOwner = false;
        _.remove($scope.contacts, function(n) {
          return n.userId === $scope.model.selectedAssignee.userId;
        });
        $scope.model.assignees.push($scope.model.selectedAssignee);
        taskFactory.assignUserToTask({
          taskId: $scope.task.projectTaskId,
          projectId: $rootScope.activitySelected.projectId,
          members: _.map($scope.model.assignees, function(el) {
            return el.userId;
          }),
          ownerId: $scope.model.selectedAssignee.userId
        }).then(function(resp) {
          $scope.model.selectedAssignee = null;
          $scope.updateTask();
          //load notification
          getAllNotifications();
        });
      };

      $scope.getContacts();
    }];
  return controller;
});