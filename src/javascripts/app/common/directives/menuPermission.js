define(function(require) {
  'use strict';
  var angular = require('angular'),
    lodash = require('lodash'),
    module;
  module = angular.module('common.directives.menuPermission', []);
  module.directive('menuPermission', [
    'permissionFactory',
    'notifications',
    function(permissionFactory,
             notifications) {
      return function(scope, element, attrs) {
        function checkPermission() {
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
            if(!permissionFactory.checkMenuPermission(attrs.menuPermission)) {
              element.remove();
            }
          }
        }

        notifications.onCurrentProjectChange(scope, checkPermission);
      };
    }]);
  return module;
});