/**
 * Created by thophan on 9/28/2015.
 */
define(function(require) {
  'use strict';
  var angular = require('angular'),
    utilServiceModule = require('app/common/services/util'),
    config = require('app/config');
  var module = angular.module('common.filters.fileDownloadPathHash', ['app.config', 'common.services.util'])
    .filter('fileDownloadPathHash', ['appConstant', 'utilFactory', function(constant, utilFactory) {
      return function(value, name) {
        var url = constant.nodeServer + '/download/file?id=' + utilFactory.hash(encodeURIComponent(value));
        if(name) {
          url += '&name=' + encodeURIComponent(name);
        }
        return url;
      };
    }]);
  return module;
});

