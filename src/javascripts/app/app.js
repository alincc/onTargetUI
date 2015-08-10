define(function(require) {
  'use strict';

  var angular = require('angular'),
    uiRouter = require('uiRouter'),
    config = require('./config'),
    angularAnimate = require('angularAnimate'),
    userServiceModule = require('./common/context/user'),
    services = require('./common/services/index'),
    directives = require('./common/directives/index'),
    validators = require('./common/validators/index'),
    filters = require('./common/filters/index'),
    modules = require('./modules/main'),
    angularBootstrap = require('angularBootstrap'),
    angularUiEvent = require('angularUiEvent'),
  //angularMoment = require('angularMoment'),
    angularSanitize = require('angularSanitize'),
    angularLoadingBar = require('angularLoadingBar'),
    angularSvgRoundProgress = require('angularSvgRoundProgress');

  var app = angular.module('app', [
    // libraries
    'ngAnimate',
    'ui.bootstrap',
    'ui.event',
    'angular-loading-bar',
    //'angularMoment',
    'ngSanitize',
    'angular-svg-round-progress',
    //
    'app.config',
    'ui.router',
    'common.directives',
    'common.services',
    'common.validators',
    'common.filters',
    'common.context.user',
    // modules
    'app.main',
    'app.aside',
    'app.navbar',
    'app.signin',
    'app.signup',
      'app.forgotpassword',
      'app.dashboard',
      'app.requestdemo',
      'app.demosignup'
  ]);

  app
    .run(['$templateCache', 'userContext',
      function($templateCache, userContext) {
        // Load Authentication data from localstorage
        userContext.loadFromLocal();
      }
    ]);

  app.controller('AppController', ['$scope', 'appConstant', '$injector', 'userContext', function($scope, appConstant, $injector, userContext) {
    $scope.app = appConstant.app;
  }]);

  return app;
});
