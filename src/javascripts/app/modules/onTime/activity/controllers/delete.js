/**
 * Created by thophan on 8/17/2015.
 */
define(function() {
  'use strict';
  var controller = ['$scope', '$rootScope', '$modalInstance', 'countryFactory', 'projectFactory', 'activity', 'userContext', 'projectContext', 'activityFactory', 'toaster',
    function($scope, $rootScope, $modalInstance, countryFactory, projectFactory, activity, userContext, projectContext, activityFactory, toaster) {
      $scope.currentProject = $rootScope.currentProjectInfo;
      $scope.isDeleting = false;
      console.log(activity);
      $scope.delete = function() {
        $scope.isDeleting = true;
        activityFactory.deleteActivity({
          projectId: activity.projectId
        }).then(
          function(resp) {
            toaster.pop('success', 'Success', resp.data.returnMessage);
            //remove activity in local storage
            var index = $scope.currentProject.projects.indexOf(activity);
            $scope.currentProject.projects.splice(index, 1);
            projectContext.setProject($scope.currentProject);

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