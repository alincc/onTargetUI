define(function(require) {
  'use strict';
  var angular = require('angular'),
    tpl = require('text!./templates/taskComment.html'),
    _ = require('lodash'),
    module;
  module = angular.module('common.directives.taskComment', []);

  module.run([
    '$templateCache',
    function($templateCache) {
      $templateCache.put('taskComment/templates/taskComment.html', tpl);
    }]);

  module.directive('taskComment', [function() {
    return {
      restrict: 'E',
      scope: {
        task: '=task'
      },
      templateUrl: 'taskComment/templates/taskComment.html',
      controller: [
        '$scope',
        '$rootScope',
        'taskFactory',
        'pushFactory',
        function($scope,
                 $rootScope,
                 taskFactory,
                 pushFactory) {
          $scope.comments = $scope.task.comments;
          $scope.model = {
            comment: "",
            commentedBy: $rootScope.currentUserInfo.userId,
            commentedDate: '',
            commenterContact: {
              firstName: $rootScope.currentUserInfo.contact.firstName,
              lastName: $rootScope.currentUserInfo.contact.lastName
            },
            taskCommentId: 0,
            taskId: $scope.task.projectTaskId
          };

          $scope.addComment = function(_form) {
            $scope.model.commentedDate = new Date();
            taskFactory.createNewComment($scope.model).then(
              function(resp) {
                var commentObject = angular.copy($scope.model);
                commentObject.commenterContact = resp.data.user.contact;
                $scope.model.comment = '';
                $scope.model.commentedDate = '';
                $scope.$broadcast("content.reload");
                _form.$setPristine();
              }, function(err) {
                console.log(err);
                _form.$setPristine();
              });
          };

          pushFactory.bind('task.comment.' + $scope.model.taskId, function(evt) {
            if(evt.name === 'onTimeAddComment') {
              $scope.comments.push({
                comment: evt.value.comment,
                commentedBy: evt.value.commentedBy,
                commentedDate: evt.value.commentedDate,
                commenterContact: evt.value.commenterContact,
                taskCommentId: evt.value.taskCommentId,
                taskId: evt.value.taskId
              });
            }
          });

          $scope.$on('$destroy', function() {
            pushFactory.unbind('task.comment.' + $scope.model.taskId);
          });
        }],
      link: function() {

      }
    };
  }]);
  return module;
});