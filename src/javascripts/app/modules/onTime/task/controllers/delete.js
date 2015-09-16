/**
 * Created by thophan on 8/17/2015.
 */
define(function (){
  'use strict';
  var controller = ['$scope', '$rootScope', '$modalInstance', 'countryFactory', 'projectFactory', 'userContext', 'projectContext', 'activityFactory', 'toaster', 'taskFactory', 'task', 'userNotificationsFactory', 'appConstant', 'notifications',
    function ($scope, $rootScope, $modalInstance, countryFactory, projectFactory, userContext, projectContext, activityFactory, toaster, taskFactory, task, userNotificationsFactory, appConstant, notifications){

      $scope.delete = function (){
        taskFactory.deleteTask({
          taskId: task.projectTaskId
        }).then(
          function (resp){
            toaster.pop('success', 'Success', resp.data.returnMessage);
            userNotificationsFactory.getAll({
              "pageNumber": 1,
              "perPageLimit": appConstant.app.settings.userNotificationsPageSize
            }).then(function (resp){
              $rootScope.userNotifications = resp.data;
              notifications.getNotificationSuccess();
            });
            $modalInstance.close({});
          }
        );
      };

      $scope.cancel = function (){
        $modalInstance.dismiss('cancel');
      };
    }];
  return controller;
});