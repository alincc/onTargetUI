define(function(require) {
  'use strict';
  var angular = require('angular'),
    tpl = require('text!./templates/taskAssignee.html'),
    _ = require('lodash'),
    module;
  module = angular.module('common.directives.taskAssignee', []);

  module.run([
    '$templateCache',
    function($templateCache) {
      $templateCache.put('taskAssignee/templates/taskAssignee.html', tpl);
    }]);

  module.directive('taskAssignee', [function() {
    return {
      restrict: 'E',
      scope: {
        task: '=task'
      },
      templateUrl: 'taskAssignee/templates/taskAssignee.html',
      controller: [
        '$scope',
        '$rootScope',
        'taskFactory',
        function($scope,
                 $rootScope,
                 taskFactory) {
          $scope.onAddOwner = false;
          $scope.contacts = [];
          $scope.isAddOwner = false;
          $scope.model = {
            selectedAssignee: null,
            taskId: $scope.task.projectTaskId,
            projectId: $rootScope.currentProjectInfo.projectId,
            assignees: $scope.task.assignee
          };

          $scope.addOwner = function() {
            $scope.onAddOwner = true;
          };

          $scope.removeUserFromTask = function(assignee) {
            $scope.onAddOwner = false;
            _.remove($scope.model.assignees, function(n) {
              return n.userId === assignee.userId;
            });
            $scope.contacts.push(assignee);
            taskFactory.assignUserToTask({
              taskId: $scope.task.projectTaskId,
              projectId: $rootScope.currentProjectInfo.projectId,
              members: _.map($scope.model.assignees, function(el) {
                return el.userId;
              }),
              ownerId: assignee.userId
            }).then(function(resp) {
              $scope.model.selectedAssignee = null;
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
              projectId: $rootScope.currentProjectInfo.projectId,
              members: _.map($scope.model.assignees, function(el) {
                return el.userId;
              }),
              ownerId: $scope.model.selectedAssignee.userId
            }).then(function(resp) {
              $scope.model.selectedAssignee = null;
            });
          };

          // Get contacts
          taskFactory.getContacts($rootScope.currentProjectInfo.projectId)
            .success(function(resp) {
              $scope.contacts = _.filter(resp.projectMemberList, function(el) {
                return _.findIndex($scope.model.assignees, {userId: el.userId}) < 0;
              });
            });
        }],
      link: function() {

      }
    };
  }]);
  return module;
});