define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    controller = require('./controllers/signup'),
    accountServiceModule = require('app/common/services/account'),
    template = require('text!./templates/signup.html');
  var module = angular.module('app.signup', ['ui.router', 'app.config', 'common.services.account', 'common.context.user']);
  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('signup/templates/signup.html', template);
  }]);
  module.controller('SignUpController', controller);
  module.config(
    ['$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('signup', {
            url: '/signup',
            templateUrl: "signup/templates/signup.html",
            controller: 'SignUpController',
            authorization: false,
            resolve: {
              authorized: ['$rootScope', 'userContext', '$location', function($rootScope, userContext, $location) {
                if (userContext.authentication().isAuth) {
                  $location.path("/app/task/todo");
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