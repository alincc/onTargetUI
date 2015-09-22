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

        service.checkMenuPermission = function(nav) {
          //return true;
          if($rootScope.currentUserInfo.menuListPermission) {
            var permissions = $rootScope.currentUserInfo.menuListPermission;
            return angular.isDefined(_.find(permissions, {menuKey: nav}));
          }
          else {
            return false;
          }
        };

        service.checkFeaturePermission = function(nav) {
          //return true;
          if($rootScope.currentUserInfo.featureListPermission) {
            var permissions = $rootScope.currentUserInfo.featureListPermission;
            return angular.isDefined(_.find(permissions, {featureKey: nav}));
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