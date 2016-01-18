define(function(require) {
  'use strict';
  var angular = require('angular'),
    module;
  module = angular.module('common.directives.permission', []);
  module.directive('permission', [
    'permissionFactory',
    'notifications',
    function(permissionFactory,
             notifications) {
    return function(scope, element, attrs) {

      function checkPermission(){
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
      }

      checkPermission();

      notifications.onCurrentProjectChange(scope, checkPermission);
    };
  }]);
  return module;
});