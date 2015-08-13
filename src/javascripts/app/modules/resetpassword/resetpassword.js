/**
 * Created by thophan on 8/12/2015.
 */
define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    controller = require('./controllers/resetpassword'),
    accountServiceModule = require('app/common/services/account'),
    template = require('text!./templates/resetpassword.html');
  var module = angular.module('app.resetpassword', ['ui.router', 'app.config', 'common.services.account', 'common.context.user']);
  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('resetpassword/templates/resetpassword.html', template);
  }]);
  module.controller('ResetPasswordController', controller);
  module.config(
    ['$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('resetpassword', {
            url: '/pages/reset-password?q',
            templateUrl: "resetpassword/templates/resetpassword.html",
            controller: 'ResetPasswordController',
            authorization: false,
            resolve: {
              forgotPasswordTokenData: ['$rootScope', 'userContext', '$location', 'accountFactory', '$q', '$stateParams',
                function($rootScope, userContext, $location, accountFactory, $q, $stateParams) {
                var deferred = $q.defer();
                var collaborateToken = $stateParams.q;
                if(userContext.authentication().isAuth) {
                  $location.search('q', null);
                  $location.path("/app/dashboard");
                } else {
                  accountFactory.validateResetPasswordToken(collaborateToken).success(function(data) {
                    var regData = angular.extend(data, {
                      collaborateToken: collaborateToken
                    });
                    deferred.resolve(regData);
                  })
                    .error(function(data) {
                      $location.search('q', null);
                      $location.path("/signin");
                    });
                }
                return deferred.promise;
              }]
            }
          });
      }
    ]
  );

  return module;
});