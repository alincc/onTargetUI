define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    controller = require('./controllers/signin'),
    accountServiceModule = require('app/common/services/account'),
    template = require('text!./templates/signin.html');
  var module = angular.module('app.signin', ['ui.router', 'app.config', 'common.services.account', 'common.context.user']);
  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('signin/templates/signin.html', template);
  }]);
  module.controller('SignInController', controller);
  module.config(
    ['$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('signin', {
            url: '/signin',
            templateUrl: "signin/templates/signin.html",
            controller: 'SignInController',
            authorization: false,
            resolve: {
              authorized: ['$rootScope', 'userContext', '$location', function($rootScope, userContext, $location) {
                if (userContext.authentication().isAuth) {
                  $location.path("/app/dashboard");
                }
                return true;
              }]
            }
          });
      }
    ]
  );

  return module;
});