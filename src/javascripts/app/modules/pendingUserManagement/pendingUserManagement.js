/**
 * Created by thophan on 8/7/2015.
 */
define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    controller = require('./controllers/pendingUserManagement'),
    template = require('text!./templates/pendingUserManagement.html'),
    accountRequestServiceModule = require('app/common/services/accountRequest');
  var module = angular.module('app.pendingUserManagement', ['ui.router', 'app.config', 'common.context.user', 'common.services.accountRequest']);
  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('pendingUserManagement/templates/pendingUserManagement.html', template);
  }]);
  module.controller('PendingUserManagementController', controller);
  module.config(
    ['$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('app.pendingUserManagement', {
            url: '/pending-account-request',
            templateUrl: "pendingUserManagement/templates/pendingUserManagement.html",
            controller: 'PendingUserManagementController',
            authorization: false
          });
      }
    ]
  );

  return module;
});
