define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config');
  var module = angular.module('common.filters.filePath', ['app.config'])
    .filter('filePath', ['appConstant', function(constant) {
      return function(value) {
        if(/^\//.test(value)) {
          return constant.resourceUrl + value;
        }
        else {
          return constant.resourceUrl + '/' + value;
        }
      };
    }]);
  return module;
});

