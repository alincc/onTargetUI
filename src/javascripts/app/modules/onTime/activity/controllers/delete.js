/**
 * Created by thophan on 8/17/2015.
 */
define(function() {
  'use strict';
  var controller = ['$scope', '$rootScope', '$modalInstance', 'countryFactory', 'projectFactory', 'activity', 'userContext', 'projectContext', 'activityFactory', 'userNotificationsFactory', 'appConstant', 'notifications',
    function($scope, $rootScope, $modalInstance, countryFactory, projectFactory, activity, userContext, projectContext, activityFactory, userNotificationsFactory, appConstant, notifications) {
      $scope.currentProject = $rootScope.currentProjectInfo;
      $scope.isDeleting = false;
      //console.log(activity);
      $scope.delete = function() {
        $scope.isDeleting = true;
        activityFactory.deleteActivity({
          projectId: activity.projectId
        }).then(
          function(resp) {
            //toaster.pop('success', 'Success', resp.data.returnMessage);
            //remove activity in local storage
            ///var index = $scope.currentProject.projects.indexOf(activity);
            //$scope.currentProject.projects.splice(index, 1);
            //projectContext.setProject($scope.currentProject);

            console.log('Close modal');
            //userNotificationsFactory.getAll({
            //  "pageNumber": 1,
            //  "perPageLimit": appConstant.app.settings.userNotificationsPageSize
            //}).then(function (resp){
            //  $rootScope.userNotifications = resp.data;
            //  notifications.getNotificationSuccess();
            //});
            $modalInstance.close({});
          },
          function(err) {
            console.log(err);
            $scope.isDeleting = true;
          }
        );
      };

      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };
    }];
  return controller;
});