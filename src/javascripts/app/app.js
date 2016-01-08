define(function(require) {
  'use strict';

  var angular = require('angular'),
    uiRouter = require('uiRouter'),
    config = require('./config'),
    angularAnimate = require('angularAnimate'),
    userContextModule = require('./common/context/user'),
    projectContextModule = require('./common/context/project'),
    directives = require('./common/directives/index'),
    validators = require('./common/validators/index'),
    filters = require('./common/filters/index'),
    modules = require('./modules/main'),
    angularBootstrap = require('angularBootstrap'),
    angularUiEvent = require('angularUiEvent'),
    angularSanitize = require('angularSanitize'),
    angularMoment = require('angularMoment'),
    angularLoadingBar = require('angularLoadingBar'),
    serviceModule = require('./common/services/index');

  var app = angular.module('app', [
    //libraries
    'ngAnimate',
    'angularMoment',
    'ui.bootstrap',
    'ui.event',
    'angular-loading-bar',
    'ngSanitize',
    //
    'app.config',
    'ui.router',
    'common.directives',
    'common.validators',
    'common.filters',
    'common.context.user',
    'common.context.project',
    'common.services',

    // modules
    'app.main',
    'app.aside',
    'app.navbar',
    'app.signin',
    'app.signup',
    'app.forgotpassword',
    'app.dashboard',
    'app.requestdemo',
    'app.demosignup',
    'app.pendingUserManagement',
    'app.project',
    'app.resetpassword',
    'app.onTime',
    'app.onSite',
    'app.editprofile',
    'app.company',
    'app.changePassword',
    'app.notifications',
    'app.onContact',
    'app.onTarget',
    'app.documentPreview',
    'app.onFile',
    'app.bimProject',
    'app.inviteToProject',
    // 'app.onBim'
  ]);

  app
    .run(['$templateCache', 'userContext', 'projectContext', 'userNotificationsFactory', '$rootScope', 'appConstant', 'pushFactory', 'notifications',
      function($templateCache, userContext, projectContext, userNotificationsFactory, $rootScope, constant, pushFactory, notifications) {
        // Load Authentication data from localstorage
        userContext.loadFromLocal();

        // Load permissions
        userContext.getPermissions();

        // Load project context
        projectContext.loadProject();

        // Initialize notifications service
        pushFactory.initialize();

        if($rootScope.currentProjectInfo.projectId){
          // Load notifications
          userNotificationsFactory.getAll({
            "pageNumber": 1,
            "perPageLimit": 5
          }).then(function (resp){
            $rootScope.userNotifications = resp.data;
            notifications.getNotificationSuccess();
          });
        }
      }
    ]);

  app.controller('AppController', ['$scope', 'appConstant', function($scope, appConstant) {
    $scope.app = appConstant.app;
  }]);

  return app;
});