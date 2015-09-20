/**
 * Created by thophan on 8/19/2015.
 */
define(function(require) {
  'use strict';
  var angular = require('angular'),
    lodash = require('lodash'),
    module;

  module = angular.module('common.services.permission', ['app.config']);

  module.factory('permissionFactory',
    ['appConstant', '$rootScope',
      function(constant, $rootScope) {
        var service = {};

        service.checkPermission = function(nav) {
          if($rootScope.currentUserInfo.menuProfile) {
            var permissions = $rootScope.currentUserInfo.menuProfile;
            return angular.isDefined(_.find(permissions, {menuKey: nav}));
          }
          else {
            return false;
          }
        };

        return service;
      }
    ]
  );
});