/**
 * Created by thophan on 8/20/2015.
 */
define(function(require) {
  'use strict';
  var angular = require('angular');

  var controller = ['$scope', '$rootScope', 'countryFactory', 'projectFactory', 'userContext', 'projectContext', 'activityFactory', 'toaster', 'taskFactory', 'notifications', 'permissionFactory', '$stateParams', '$location',
    function($scope, $rootScope, countryFactory, projectFactory, userContext, projectContext, activityFactory, toaster, taskFactory, notifications, permissionFactory, $stateParams, $location) {

      $scope.actions = {
        info: {
          name: "info"
        },
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

      var checkPermission = function() {
        if(permissionFactory.checkFeaturePermission('VIEW_TASK_MEMBER')) {
          $scope.action = $scope.actions.owner;
        } else if(permissionFactory.checkFeaturePermission('VIEW_TASK_COMMENT')) {
          $scope.action = $scope.actions.comment;
        } else if(permissionFactory.checkFeaturePermission('VIEW_TASK_BUDGET')) {
          $scope.action = $scope.actions.budget;
        } else if(permissionFactory.checkFeaturePermission('VIEW_TASK_PERCENTAGE')) {
          $scope.action = $scope.actions.progress;
        } else if(permissionFactory.checkFeaturePermission('VIEW_TASK_ATTACHMENT')) {
          $scope.action = $scope.actions.attachment;
        }
      };

      if($rootScope.backtoAttachments) {
        $scope.action = $scope.actions.attachment;
        $rootScope.backtoAttachments = false;
      } else {
        //checkPermission();
        if($stateParams.tab && $scope.actions[$stateParams.tab]) {
          $scope.action = $scope.actions[$stateParams.tab];
        }
        else {
          $scope.action = $scope.actions.info;
        }
      }

      $scope.openAction = function(action) {
        if(angular.isDefined(action)){
          if(action.name === 'comment'){
            $rootScope.currentTask.activeComment = true;
          }else{
            $rootScope.currentTask.activeComment = false;
          }

          $scope.action = action;
          $location.search('tab', action.name);
        }
      };

      $scope.cancel = function() {
        //notifications.taskSelection({
        //  action: 'info'
        //});
        notifications.taskCancel();
      };

      $scope.edit = function() {
        notifications.taskSelection({task: $scope.currentTask, action: 'edit'});
      };

      notifications.onTaskSelection($scope, function(args) {
        //$scope.action = $scope.actions[args.tab];
        $scope.openAction($scope.actions[args.tab]);
      });
    }];
  return controller;
});