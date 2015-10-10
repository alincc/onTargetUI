/**
 * Created by thophan on 8/20/2015.
 */
define(function (){
  'use strict';
  var controller = ['$scope', '$rootScope', 'countryFactory', 'projectFactory', 'userContext', 'projectContext', 'activityFactory', 'toaster', 'taskFactory', 'notifications', 'permissionFactory',
    function ($scope, $rootScope, countryFactory, projectFactory, userContext, projectContext, activityFactory, toaster, taskFactory, notifications, permissionFactory){

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

      var checkPermission = function (){
        if(permissionFactory.checkFeaturePermission('VIEW_TASK_MEMBER')) {
          $scope.action = $scope.actions.owner;
        } else if(permissionFactory.checkFeaturePermission('VIEW_TASK_COMMENT')) {
          $scope.action = $scope.actions.comment;
        }else if(permissionFactory.checkFeaturePermission('VIEW_TASK_BUDGET')) {
          $scope.action = $scope.actions.budget;
        }else if(permissionFactory.checkFeaturePermission('VIEW_TASK_PERCENTAGE')) {
          $scope.action = $scope.actions.progress;
        }else if(permissionFactory.checkFeaturePermission('VIEW_TASK_ATTACHMENT')) {
          $scope.action = $scope.actions.attachment;
        }
      };

      if($rootScope.backtoAttachments)
      {
        $scope.action = $scope.actions.attachment;
        $rootScope.backtoAttachments = false;
      } else {
        checkPermission();
      }

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