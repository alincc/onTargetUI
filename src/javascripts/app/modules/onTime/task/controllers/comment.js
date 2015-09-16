/**
 * Created by thophan on 8/20/2015.
 */
define(function(require) {
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', 'countryFactory', 'projectFactory', 'userContext', 'projectContext', 'activityFactory', 'toaster', 'taskFactory', 'notifications', 'userNotificationsFactory', 'appConstant',
    function($scope, $rootScope, countryFactory, projectFactory, userContext, projectContext, activityFactory, toaster, taskFactory, notifications, userNotificationsFactory, appConstant) {
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
            $scope.comments.push(commentObject);
            $scope.model.comment = '';
            $scope.model.commentedDate = '';
            $scope.$broadcast("content.reload");
            $scope.comment_form.$setPristine();
            //notifications.taskUpdated();
            userNotificationsFactory.getAll({
              "pageNumber": 1,
              "perPageLimit": appConstant.app.settings.userNotificationsPageSize
            });
          }, function(err) {
            console.log(err);
            $scope.comment_form.$setPristine();
          });
      };

      notifications.onTaskSelection($scope, function() {
        $scope.comments = $rootScope.currentTask.comments;
      });
    }];
  return controller;
});