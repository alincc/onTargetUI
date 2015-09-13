/**
 * Created by thophan on 8/20/2015.
 */
define(function (){
  'use strict';
  var controller = ['$scope', '$rootScope', 'countryFactory', 'projectFactory', 'userContext', 'projectContext', 'activityFactory', 'toaster', 'taskFactory', 'notifications',
    function ($scope, $rootScope, countryFactory, projectFactory, userContext, projectContext, activityFactory, toaster, taskFactory, notifications){

      $scope.actions = {
        owner: {
          name: "owner"
        },
        comment: {
          name: "comment"
        },
        budget: {
          name: "budget"
        },
        progress: {
          name: "progress"
        },
        attachment: {
          name: "attachment"
        }
      };
      $scope.action = $scope.actions.owner;

      $scope.openAction = function (action){
        $scope.action = action;
      };

      $scope.cancel = function() {
        notifications.taskSelection({
          action: 'info'
        });
      };

      var setTaskListHeight = function (){
        var activityHeadingHeight = document.getElementById('activity-list-heading').offsetHeight;
        document.getElementById('task-logistic-panel').setAttribute("style","height:" + (activityHeadingHeight + 539)  + "px");
      };

      setTaskListHeight();
    }];
  return controller;
});