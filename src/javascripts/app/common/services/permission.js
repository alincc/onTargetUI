define(function(require) {
  'use strict';
  var angular = require('angular'),
    _ = require('lodash'),
    module;

  module = angular.module('common.services.permission', [
    'app.config'
  ]);

  module.factory('permissionFactory', [
      'appConstant',
      '$rootScope',
      'userContext',
      function(constant,
               $rootScope,
               userContext) {
        var service = {};

        service.checkMenuPermission = function(nav) {
          var permissions = userContext.getPermissions().menuListPermissions;
          //return true;
          if(permissions.length) {
            return angular.isDefined(_.find(permissions, {menuKey: nav}));
          }
          else {
            return false;
          }
        };

        service.checkFeaturePermission = function(nav) {
          var permissions = userContext.getPermissions().featureListPermissions;
          //return true;
          if(permissions.length) {
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