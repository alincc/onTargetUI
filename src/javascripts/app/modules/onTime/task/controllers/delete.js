/**
 * Created by thophan on 8/17/2015.
 */
define(function (){
  'use strict';
  var controller = ['$scope', '$rootScope', '$modalInstance', 'countryFactory', 'projectFactory', 'userContext', 'projectContext', 'activityFactory', 'toaster', 'taskFactory', 'task',
    function ($scope, $rootScope, $modalInstance, countryFactory, projectFactory, userContext, projectContext, activityFactory, toaster, taskFactory, task){

      $scope.delete = function (){
        taskFactory.deleteTask({
          taskId: task.projectTaskId
        }).then(
          function (resp){
            toaster.pop('success', 'Success', resp.data.returnMessage);
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