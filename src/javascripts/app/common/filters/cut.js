define(function(require) {
  'use strict';
  var angular = require('angular');
  var module = angular.module('common.filters.cut', [])
    .filter('cut', function() {
      return function(value, wordwise, max, tail) {
        if(!value) {
          return '';
        }

        max = parseInt(max, 10);

        if(!max) {
          return value;
        }
        if(value.length <= max) {
          return value;
        }

        value = value.substr(0, max);
        if(wordwise) {
          var lastspace = value.lastIndexOf(' ');
          if(lastspace !== -1) {
            value = value.substr(0, lastspace);
          }
        }

        return value + (tail || '...');
      };
    });
  return module;
});

