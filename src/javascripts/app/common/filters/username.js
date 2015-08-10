define(function(require) {
  'use strict';
  var angular = require('angular');
  var module = angular.module('common.filters.username', [])
    .filter('username', function() {
      return function(value, emptyValue) {
        if (!value) {
          return emptyValue ? emptyValue : '';
        }
        if (value.firstName && value.lastName) {
          return value.firstName + ' ' + value.lastName;
        }
        else if (value.email) {
          if (value.email.indexOf('@') > -1) {
            return value.email.split('@')[0];
          }
        }
        else {
          return emptyValue ? emptyValue : '';
        }
      };
    });
  return module;
});

