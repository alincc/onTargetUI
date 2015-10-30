define(function(require) {
  'use strict';
  var angular = require('angular'),
    permissionService = require('app/common/services/permission'),
    lodash = require('lodash'),
    module;
  module = angular.module('common.directives.menuPermission', ['common.services.permission']);
  module.directive('menuPermission', ['permissionFactory', function(permissionFactory) {
    return function(scope, element, attrs) {
      if(attrs.menuPermission.indexOf(',') > -1) {
        var permissions = attrs.menuPermission.split(',');
        var flag = _.filter(permissions, function(el) {
            return !permissionFactory.checkMenuPermission(el);
          }).length > 0;
        if(flag) {
          element.remove();
        }
      }
      else {
        if(permissionFactory.checkMenuPermission(attrs.menuPermission)) {
        } else {
          element.remove();
        }
      }
    };
  }]);
  return module;
});