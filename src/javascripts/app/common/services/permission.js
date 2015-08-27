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
          var permissions = $rootScope.currentUserInfo.menuProfile.profileAssignedMenuList;
          return angular.isDefined(_.find(permissions, {menuKey: nav}));
        };

        return service;
      }
    ]
  );
});