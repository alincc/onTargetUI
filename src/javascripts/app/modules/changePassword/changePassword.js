define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    controller = require('./controllers/changePassword'),
    template = require('text!./templates/changePassword.html'),
    changePasswordService = require('app/common/services/changePassword');

  var module = angular.module('app.changePassword', ['app.config', 'common.services.changePassword']);

  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('changePassword/templates/changePassword.html', template);
  }]);
  module.controller('ChangePasswordController', controller);
  module.config(
    ['$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('app.changePassword', {
            url: '/changePassword',
            templateUrl: "changePassword/templates/changePassword.html",
            controller: 'ChangePasswordController',
            authorization: true,
            fullWidth: true
          });
      }
    ]
  );
  return module;
});