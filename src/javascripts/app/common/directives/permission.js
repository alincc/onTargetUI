define(function(require) {
  'use strict';
  var angular = require('angular'),
    permissionService = require('app/common/services/permission'),
    module;
  module = angular.module('common.directives.permission', ['common.services.permission']);
  module.directive('permission', ['permissionFactory', function(permissionFactory) {
    return function(scope, element, attrs) {
      if(attrs.permission.indexOf(',') > -1) {
        var permissions = attrs.permission.split(',');
        var flag = _.filter(permissions, function(el) {
            return !permissionFactory.checkFeaturePermission(el);
          }).length > 0;
        if(flag) {
          element.remove();
        }
      }
      else {
        if(!permissionFactory.checkFeaturePermission(attrs.permission)) {
          element.remove();
        }
      }
    };
  }]);
  return module;
});