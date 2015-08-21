define(function (require){
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
    angularLoadingBar = require('angularLoadingBar'),
    userNotificationModule = require('./common/services/userNotifications'),
    mockServiceModule = require('./common/services/mock');

  var app = angular.module('app', [
    // libraries
    'ngAnimate',
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
    'common.services.userNotifications',
    'common.services.mock',

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
    'app.notifications'
  ]);

  app
    .run(['$templateCache', 'userContext', 'projectContext', 'userNotificationsFactory', '$rootScope', 'appConstant',
      function ($templateCache, userContext, projectContext, userNotificationsFactory, $rootScope, constant) {
        // Load Authentication data from localstorage
        userContext.loadFromLocal();
        projectContext.loadProject();

        if($rootScope.currentUserInfo) {
          var requestPayload = {
            "pageNumber": 1,
            "perPageLimit": constant.app.settings.userNotificationsPageSize,
            "userId": $rootScope.currentUserInfo.userId
          };
          userNotificationsFactory.startGetAll(requestPayload);
        }
      }
    ]);

  app.controller('AppController', ['$scope', 'appConstant', function ($scope, appConstant){
    $scope.app = appConstant.app;
  }]);

  return app;
});