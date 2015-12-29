define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    tpl = require('text!./templates/taskComment.html'),
    _ = require('lodash'),
    module;
  module = angular.module('common.directives.taskComment', [
    'app.config'
  ]);

  module.run([
    '$templateCache',
    function($templateCache) {
      $templateCache.put('taskComment/templates/taskComment.html', tpl);
    }]);

  module.directive('taskComment', [
    '$customScroll',
    '$timeout',
    function($customScroll,
             $timeout) {
      return {
        restrict: 'E',
        scope: {
          task: '=task',
          height: '@'
        },
        templateUrl: 'taskComment/templates/taskComment.html',
        controller: [
          '$scope',
          '$rootScope',
          'taskFactory',
          'pushFactory',
          'appConstant',
          function($scope,
                   $rootScope,
                   taskFactory,
                   pushFactory,
                   appConstant) {
            $scope.height = $scope.height || 210;
            $scope.app = appConstant.app;
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
                  $scope.comments.push({
                    comment: resp.data.taskComment.comment,
                    commentedBy: resp.data.taskComment.commentedBy.userId,
                    commentedDate: resp.data.taskComment.commentedDate,
                    commenterContact: resp.data.taskComment.commenterContact,
                    taskCommentId: resp.data.taskComment.taskCommentId,
                    taskId: resp.data.taskComment.taskId
                  });

                  var commentObject = angular.copy($scope.model);
                  commentObject.commenterContact = resp.data.taskComment.commenterContact;
                  $scope.model.comment = '';
                  $scope.model.commentedDate = '';
                  $scope.$broadcast('taskComment.addCommentSuccessful');
                  _form.$setPristine();
                },
                function(err) {
                  console.log(err);
                  $scope.$broadcast('taskComment.addCommentFailed');
                  _form.$setPristine();
                });
            };

            pushFactory.bind('project-' + $rootScope.currentProjectInfo.projectId + ':onTime:task-' + $scope.model.taskId, function(evt) {
              if(evt.name === 'onTimeAddComment') {
                var found = _.find($scope.comments, {taskCommentId: evt.value.taskCommentId});
                if(!found) {
                  $scope.comments.push({
                    comment: evt.value.comment,
                    commentedBy: evt.value.commentedBy,
                    commentedDate: evt.value.commentedDate,
                    commenterContact: evt.value.commenterContact,
                    taskCommentId: evt.value.taskCommentId,
                    taskId: evt.value.taskId
                  });
                }
              }
            });

            $scope.$on('$destroy', function() {
              pushFactory.unbind('project-' + $rootScope.currentProjectInfo.projectId + ':onTime:task-' + $scope.model.taskId);
            });
          }],
        link: function(scope) {
          var scroller = $customScroll.get('taskComment');
          scope.$on('taskComment.addCommentSuccessful', function() {
            scroller.updateScroll();
            if(scroller.atBottom) {
              scroller.scrollTo('bottom');
            }
          });

          scope.$on('taskComment.addCommentFailed', function() {
            console.log(scroller);
          });
        }
      };
    }]);
  return module;
});