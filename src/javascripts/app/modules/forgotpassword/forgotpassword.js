define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    controller = require('./controllers/forgotpassword'),
    accountServiceModule = require('app/common/services/account'),
    angularMessages = require('angularMessages'),
    template = require('text!./templates/forgotpassword.html');
  var module = angular.module('app.forgotpassword', ['ui.router', 'app.config', 'common.services.account', 'common.context.user', 'ngMessages']);
  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('forgotpassword/templates/forgotpassword.html', template);
  }]);
  module.controller('ForgotPasswordController', controller);
  module.config(
    ['$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('forgotpassword', {
            url: '/forgot-password',
            templateUrl: "forgotpassword/templates/forgotpassword.html",
            controller: 'ForgotPasswordController',
            authorization: false,
            resolve: {
              authorized: ['$rootScope', 'userContext', '$location', function($rootScope, userContext, $location) {
                if(userContext.authentication().isAuth) {
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