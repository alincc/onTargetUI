define(function(require) {
  'use strict';
  var angular = require('angular');
  var module = angular.module('common.filters.fileName', [])
    .filter('fileName', [function() {
      return function(value) {
        return value.substring(value.lastIndexOf('/') + 1);
      };
    }]);
  return module;
});

