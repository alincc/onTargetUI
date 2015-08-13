define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    controller = require('./controllers/requestdemo'),
    accountServiceModule = require('app/common/services/account'),
    template = require('text!./templates/requestdemo.html');
  var module = angular.module('app.requestdemo', ['ui.router', 'app.config', 'common.services.account']);
  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('requestdemo/templates/requestdemo.html', template);
  }]);
  module.controller('RequestDemoController', controller);
  module.config(
    ['$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('requestdemo', {
            url: '/request-demo',
            templateUrl: 'requestdemo/templates/requestdemo.html',
            controller: 'RequestDemoController',
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