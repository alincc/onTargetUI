/**
 * Created by thophan on 8/20/2015.
 */
define(function(require) {
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', 'countryFactory', 'projectFactory', 'userContext', 'projectContext', 'activityFactory', 'toaster', 'taskFactory', 'notifications', 'userNotificationsFactory', 'appConstant', 'pushFactory', 'accountFactory',
    function($scope, $rootScope, countryFactory, projectFactory, userContext, projectContext, activityFactory, toaster, taskFactory, notifications, userNotificationsFactory, appConstant, pushFactory, accountFactory) {
      $scope.comments = $rootScope.currentTask.comments;
      console.log(userContext.authentication().userData.contact);
      var userInfo = userContext.authentication().userData.contact;
      $scope.model = {
        comment: "",
        commentedBy: userContext.authentication().userData.userId,
        commentedDate: '',
        commenterContact: {
          firstName: userInfo.firstName,
          lastName: userInfo.lastName
        },
        taskCommentId: 0,
        taskId: $rootScope.currentTask.projectTaskId
      };

      console.log($scope.comments);

      $scope.addComment = function() {
        $scope.model.commentedDate = new Date();
        taskFactory.createNewComment($scope.model).then(
          function(resp) {
            var commentObject = angular.copy($scope.model);
            commentObject.commenterContact = resp.data.user.contact;
            //$scope.comments.push(commentObject);
            $scope.model.comment = '';
            $scope.model.commentedDate = '';
            $scope.$broadcast("content.reload");
            $scope.comment_form.$setPristine();
            //notifications.taskUpdated();
            //userNotificationsFactory.getAll({
            //  "pageNumber": 1,
            //  "perPageLimit": appConstant.app.settings.userNotificationsPageSize
            //}).then(function (resp){
            //  $rootScope.userNotifications = resp.data;
            //  notifications.getNotificationSuccess();
            //});
          }, function(err) {
            console.log(err);
            $scope.comment_form.$setPristine();
          });
      };

      notifications.onTaskSelection($scope, function() {
        $scope.comments = $rootScope.currentTask.comments;
      });

      console.log('Listen event: '+'');

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
    }];
  return controller;
});