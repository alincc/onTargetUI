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
    angularLoadingBar = require('angularLoadingBar');

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
    'app.resetpassword'
  ]);

  app
    .run(['$templateCache', 'userContext', 'projectContext',
      function ($templateCache, userContext, projectContext){
        // Load Authentication data from localstorage
        userContext.loadFromLocal();
        projectContext.loadProject();
      }
    ]);

  app.controller('AppController', ['$scope', 'appConstant', function ($scope, appConstant){
    $scope.app = appConstant.app;
  }]);

  return app;
});
