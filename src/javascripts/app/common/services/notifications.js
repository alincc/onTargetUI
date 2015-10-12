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
        _TASK_DELETED_ = '_TASK_DELETED_',
        _TASK_CANCEL_ = '_TASK_CANCEL_',
        _ASSIGNEE_SELECTION_ = '_ASSIGNEE_SELECTION_',
        _UPDATE_PROFILE_SUCCESS_ = '_UPDATE_PROFILE_SUCCESS_',
        _GET_USER_NOTIFICATIONS_SUCCESS_ = '_GET_USER_NOTIFICATIONS_SUCCESS_',
        _ACTIVITY_SELECTION_ = '_ACTIVITY_SELECTION_',
        _ACTIVITY_DELETED_ = '_ACTIVITY_DELETED_',
        _CURRENT_PROJECT_CHANGE_ = '_CURRENT_PROJECT_CHANGE_',
        _CREATE_ACTIVITY_ = '_ADD_ACTIVITY_',
        _EDIT_ACTIVITY_ = '_EDIT_ACTIVITY_',
        _CANCEL_ACTIVITY_ = 'CANCEL_ACTIVITY',
        _ACTIVITY_CREATED_ = '_ACTIVITY_CREATED_',
        _ACTIVITY_UPDATED_ = '_ACTIVITY_UPDATED_',
        _BUDGET_UPDATED_ = '_BUDGET_UPDATED_',
        _DOCUMENT_UPLOADED_ = '_DOCUMENT_UPLOADED_',
        _DOCUMENT_SELECTED_ = '_DOCUMENT_SELECTED_',

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
        taskDeleted = function (args){
          $rootScope.$broadcast(_TASK_DELETED_, args);
        },
        onTaskDeleted = function ($scope, handler){
          $scope.$on(_TASK_DELETED_, function (event, args){
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
        },
        activityDeleted = function (args){
          $rootScope.$broadcast(_ACTIVITY_DELETED_, args);
        },
        onActivityDeleted = function ($scope, handler){
          $scope.$on(_ACTIVITY_DELETED_, function (event, args){
            handler(args);
          });
        },
        currentProjectChange = function (args){
          $rootScope.$broadcast(_CURRENT_PROJECT_CHANGE_, args);
        },
        onCurrentProjectChange = function ($scope, handler){
          $scope.$on(_CURRENT_PROJECT_CHANGE_, function (event, args){
            handler(args);
          });
        },
        createActivity = function (args){
          $rootScope.$broadcast(_CREATE_ACTIVITY_, args);
        },
        onCreateActivity = function ($scope, handler){
          $scope.$on(_CREATE_ACTIVITY_, function (event, args){
            handler(args);
          });
        },
        editActivity = function (args){
          $rootScope.$broadcast(_EDIT_ACTIVITY_, args);
        },
        onEditActivity = function ($scope, handler){
          $scope.$on(_EDIT_ACTIVITY_, function (event, args){
            handler(args);
          });
        },
        cancelActivity = function (args){
          $rootScope.$broadcast(_CANCEL_ACTIVITY_, args);
        },
        onCancelActivity = function ($scope, handler){
          $scope.$on(_CANCEL_ACTIVITY_, function (event, args){
            handler(args);
          });
        },
        activityCreated = function (args){
          $rootScope.$broadcast(_ACTIVITY_CREATED_, args);
        },
        onActivityCreated = function ($scope, handler){
          $scope.$on(_ACTIVITY_CREATED_, function (event, args){
            handler(args);
          });
        },
        activityEdited = function (args){
          $rootScope.$broadcast(_ACTIVITY_UPDATED_, args);
        },
        onActivityEdited = function ($scope, handler){
          $scope.$on(_ACTIVITY_UPDATED_, function (event, args){
            handler(args);
          });
        },
        budgetUpdated = function (args){
          $rootScope.$broadcast(_BUDGET_UPDATED_, args);
        },
        onBudgetUpdated = function ($scope, handler){
          $scope.$on(_BUDGET_UPDATED_, function (event, args){
            handler(args);
          });
        },
        documentUploaded = function (args){
          $rootScope.$broadcast(_DOCUMENT_UPLOADED_, args);
        },
        onDocumentUploaded = function ($scope, handler){
          $scope.$on(_DOCUMENT_UPLOADED_, function (event, args){
            handler(args);
          });
        },
        documentSelected = function (args){
          $rootScope.$broadcast(_DOCUMENT_UPLOADED_, args);
        },
        onDocumentSelected = function ($scope, handler){
          $scope.$on(_DOCUMENT_UPLOADED_, function (event, args){
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
        taskDeleted: taskDeleted,
        onTaskDeleted: onTaskDeleted,
        taskCancel: taskCancel,
        onTaskCancel: onTaskCancel,
        logoutSuccess: logoutSuccess,
        onLogoutSuccess: onLogoutSuccess,
        updateProfileSuccess: updateProfileSuccess,
        onUpdateProfileSuccess: onUpdateProfileSuccess,
        getNotificationSuccess: getNotificationSuccess,
        onGetNotificationSuccess: onGetNotificationSuccess,
        activitySelection: activitySelection,
        onActivitySelection: onActivitySelection,
        activityDeleted: activityDeleted,
        onActivityDeleted: onActivityDeleted,
        currentProjectChange: currentProjectChange,
        onCurrentProjectChange: onCurrentProjectChange,
        createActivity: createActivity,
        onCreateActivity: onCreateActivity,
        editActivity: editActivity,
        onEditActivity: onEditActivity,
        cancelActivity: cancelActivity,
        onCancelActivity: onCancelActivity,
        activityCreated: activityCreated,
        onActivityCreated: onActivityCreated,
        activityEdited: activityEdited,
        onActivityEdited: onActivityEdited,
        budgetUpdated: budgetUpdated,
        onBudgetUpdated: onBudgetUpdated,
        documentUploaded: documentUploaded,
        onDocumentUploaded: onDocumentUploaded,
        documentSelected: documentSelected,
        onDocumentSelected: onDocumentSelected
      };
    }]);
});