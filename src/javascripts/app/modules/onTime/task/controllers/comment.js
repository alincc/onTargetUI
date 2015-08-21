/**
 * Created by thophan on 8/20/2015.
 */
define(function (){
  'use strict';
  var controller = ['$scope', '$rootScope', 'countryFactory', 'projectFactory', 'userContext', 'projectContext', 'activityFactory', 'toaster', 'taskFactory', 'notifications',
    function ($scope, $rootScope, countryFactory, projectFactory, userContext, projectContext, activityFactory, toaster, taskFactory, notifications){
      $scope.comments = $rootScope.currentTask.comments;
      console.log(userContext.authentication().userData.contact);
      var userInfo = userContext.authentication().userData.contact;
      $scope.model = {
        comment: "",
        commentedBy: userContext.authentication().userData.userId,
        commentedDate: '',
        commenterContact: {
        },
        taskCommentId: 0,
        taskId: $rootScope.currentTask.projectTaskId
      };

      console.log($scope.comments);

      $scope.addComment = function (){
        $scope.model.comment = $scope.comment;
        $scope.comment = '';
        $scope.model.commentedDate = new Date();
        taskFactory.createNewComment($scope.model).then(
          function (resp){
            toaster.pop('success', 'Success', resp.data.returnMessage);
            $scope.$broadcast("content.reload");
            $scope.model.commenterContact = {
              firstName: userInfo.firstName,
              lastName: userInfo.lastName
            };
            $scope.comments.push($scope.model);
            //notifications.taskUpdated();
          }, function (err){
            console.log(err);
          });
      };

      notifications.onTaskSelection($scope, function (){
        $scope.comments = $rootScope.currentTask.comments;
      });
    }];
  return controller;
});