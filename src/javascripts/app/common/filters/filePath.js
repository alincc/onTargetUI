define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config');
  var module = angular.module('common.filters.filePath', ['app.config'])
    .filter('filePath', ['appConstant', function(constant) {
      return function(value, type) {
        if(type === 'node') {
          if(/^\//.test(value)) {
            return constant.nodeServer + value;
          }
          else {
            return constant.nodeServer + '/' + value;
          }
        }
        else if(type === 'relative' && /\/assets\//.test(value)) {
          return 'assets/' + value.split('assets/')[1];
        }
        else {
          if(/^http/.test(value)) {
            return value;
          }
          else {
            if(/^\//.test(value)) {
              return constant.resourceUrl + value;
            }
            else {
              return constant.resourceUrl + '/' + value;
            }
          }
        }
      };
    }]);
  return module;
});

