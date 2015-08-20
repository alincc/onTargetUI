define([
  'angular'
], function (angular){
  'use strict';

  return angular.module('common.services.notifications', [])
    .factory('notifications', ['$rootScope', function ($rootScope){
      // private notification messages
      // If you make a new notification you will add it here
      // we should use this service only for notifications
      var _START_REQUEST_ = '_START_REQUEST_',
        _END_REQUEST_ = '_END_REQUEST_',
        _ENTITY_CLICKED_ = '_ENTITY_CLICKED_',
        _LOGIN_SUCCESS_ = '_LOGIN_SUCCESS_',
        _LOGOUT_SUCCESS_ = '_LOGOUT_SUCCESS_',
        _TASK_SELECTION_ = '_TASK_SELECTION_',
        _TASK_CREATED_ = '_TASK_CREATED_',
        _TASK_UPDATED_ = '_TASK_UPDATED_',
        _TASK_CANCEL_ = '_TASK_CANCEL_',
        _ASSIGNEE_SELECTION_ = '_ASSIGNEE_SELECTION_',
        _UPDATE_PROFILE_SUCCESS_ = '_UPDATE_PROFILE_SUCCESS_',
        _GET_USER_NOTIFICATIONS_SUCCESS_ = '_GET_USER_NOTIFICATIONS_SUCCESS_',
        _ACTIVITY_SELECTION_ = '_ACTIVITY_SELECTION_',

        requestStarted = function (){
          $rootScope.$broadcast(_START_REQUEST_);
        },
        requestEnded = function (){
          $rootScope.$broadcast(_END_REQUEST_);
        },
        entityClicked = function (args){
          $rootScope.$broadcast(_ENTITY_CLICKED_, args);
        },
        loginSuccess = function (args){
          $rootScope.$broadcast(_LOGIN_SUCCESS_, args);
        },
        logoutSuccess = function (args){
          $rootScope.$broadcast(_LOGOUT_SUCCESS_, args);
        },
        onRequestStarted = function ($scope, handler){
          $scope.$on(_START_REQUEST_, function (event){
            handler();
          });
        },
        onEntityClicked = function ($scope, handler){
          $scope.$on(_ENTITY_CLICKED_, function (event, args){
            handler(args);
          });
        },
        onLoginSuccess = function ($scope, handler){
          $scope.$on(_LOGIN_SUCCESS_, function (event, args){
            handler(args);
          });
        },
        onLogoutSuccess = function (handler){
          $rootScope.$on(_LOGOUT_SUCCESS_, function (event, args){
            handler(args);
          });
        },
        onRequestEnded = function ($scope, handler){
          $scope.$on(_END_REQUEST_, function (event){
            handler();
          });
        },
        taskSelection = function (args){
          $rootScope.$broadcast(_TASK_SELECTION_, args);
        },
        onTaskSelection = function ($scope, handler){
          $scope.$on(_TASK_SELECTION_, function (event, args){
            handler(args);
          });
        },
        taskCreated = function (args){
          $rootScope.$broadcast(_TASK_CREATED_, args);
        },
        onTaskCreated = function ($scope, handler){
          $scope.$on(_TASK_CREATED_, function (event, args){
            handler(args);
          });
        },
        selectAssignee = function (args){
          $rootScope.$broadcast(_ASSIGNEE_SELECTION_, args);
        },
        onSelectAssignee = function ($scope, handler){
          $scope.$on(_ASSIGNEE_SELECTION_, function (event, args){
            handler(args);
          });
        },
        taskUpdated = function (args){
          $rootScope.$broadcast(_TASK_UPDATED_, args);
        },
        onTaskUpdated = function ($scope, handler){
          $scope.$on(_TASK_UPDATED_, function (event, args){
            handler(args);
          });
        },
        taskCancel = function (args){
          $rootScope.$broadcast(_TASK_CANCEL_, args);
        },
        onTaskCancel = function ($scope, handler){
          $scope.$on(_TASK_CANCEL_, function (event, args){
            handler(args);
          });
        },
        updateProfileSuccess = function (args){
          $rootScope.$broadcast(_UPDATE_PROFILE_SUCCESS_, args);
        },
        onUpdateProfileSuccess = function ($scope, handler){
          $scope.$on(_UPDATE_PROFILE_SUCCESS_, function (event, args){
            handler(args);
          });
        },
        getNotificationSuccess = function (){
          $rootScope.$broadcast(_GET_USER_NOTIFICATIONS_SUCCESS_);
        },
        onGetNotificationSuccess = function ($scope, handler){
          $scope.$on(_GET_USER_NOTIFICATIONS_SUCCESS_, function (event, args){
            handler(args);
          });
        },
        activitySelection = function (args){
          $rootScope.$broadcast(_ACTIVITY_SELECTION_, args);
        },
        onActivitySelection = function ($scope, handler){
          $scope.$on(_ACTIVITY_SELECTION_, function (event, args){
            handler(args);
          });
        };

      return {
        requestStarted: requestStarted,
        requestEnded: requestEnded,
        entityClicked: entityClicked,
        loginSuccess: loginSuccess,
        onRequestStarted: onRequestStarted,
        onRequestEnded: onRequestEnded,
        onEntityClicked: onEntityClicked,
        onLoginSuccess: onLoginSuccess,
        taskSelection: taskSelection,
        onTaskSelection: onTaskSelection,
        taskCreated: taskCreated,
        onTaskCreated: onTaskCreated,
        selectAssignee: selectAssignee,
        onSelectAssignee: onSelectAssignee,
        taskUpdated: taskUpdated,
        onTaskUpdated: onTaskUpdated,
        taskCancel: taskCancel,
        onTaskCancel: onTaskCancel,
        logoutSuccess: logoutSuccess,
        onLogoutSuccess: onLogoutSuccess,
        updateProfileSuccess: updateProfileSuccess,
        onUpdateProfileSuccess: onUpdateProfileSuccess,
        getNotificationSuccess: getNotificationSuccess,
        onGetNotificationSuccess: onGetNotificationSuccess,
        activitySelection: activitySelection,
        onActivitySelection: onActivitySelection
      };
    }]);
});