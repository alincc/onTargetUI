/**
 * Created by thophan on 9/28/2015.
 */
define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config');
  var module = angular.module('common.filters.fileDownloadPath', ['app.config'])
    .filter('fileDownloadPath', ['appConstant', function(constant) {
      return function(value) {
          return constant.resourceUrl + '/download/file?url=' + value;
      };
    }]);
  return module;
});

