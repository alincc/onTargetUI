define(function (require){
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    controller = require('./controllers/signup'),
    accountServiceModule = require('app/common/services/account'),
    template = require('text!./templates/signup.html'),
    uimask = require('angularUiMask'),
    fileupload = require('app/common/services/upload'),
    userAvatar = require('app/common/directives/userAvatar'),
    toaster = require('toaster'),
    ngFileUpload = require('ngFileUpload');
  var module = angular.module('app.signup', ['ui.router', 'app.config', 'common.services.account', 'common.context.user', 'ui.mask', 'common.services.upload', 'common.directives.userAvatar', 'toaster', 'ngFileUpload']);
  module.run(['$templateCache', function ($templateCache){
    $templateCache.put('signup/templates/signup.html', template);
  }]);
  module.controller('SignUpController', controller);
  module.config(
    ['$stateProvider',
      function ($stateProvider){
        $stateProvider
          .state('signup', {
            url: '/pages/signup?q',
            templateUrl: "signup/templates/signup.html",
            controller: 'SignUpController',
            authorization: false,
            resolve: {
              registrationTokenData: ['$rootScope', 'userContext', '$location', 'accountFactory', '$q', '$stateParams', function ($rootScope, userContext, $location, accountFactory, $q, $stateParams){
                var deferred = $q.defer();
                var collaborateToken = $stateParams.q;
                if (userContext.authentication().isAuth) {
                  $location.search('q', null);
                  $location.path("/app/dashboard");
                } else {
                  accountFactory.validateSignupToken(collaborateToken).success(function (data){
                    var regData = angular.extend(data, {
                      collaborateToken: collaborateToken
                    });
                    deferred.resolve(regData);
                  })
                    .error(function (data){
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