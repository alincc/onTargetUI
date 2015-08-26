define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    fileupload = require('ngFileUpload'),
    utilService = require('app/common/services/util');
  var module = angular.module('common.services.parser', ['app.config', 'ngFileUpload', 'common.services.util']);
  module.factory('parserFactory', ['$http', 'appConstant', 'Upload', 'utilFactory', function($http, constant, Upload, utilFactory) {
    var services = {};

    services.parseXls = function(file) {
      return Upload.upload({
        url: constant.nodeServer + '/node/xls-parser',
        file: file,
        fields: {'uuid': utilFactory.newGuid(), 'fileName': file.name},
        headers: {
          'Authorization': false
        }
      });
    };

    return services;
  }]);
  return module;
});