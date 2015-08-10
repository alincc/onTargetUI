define(function (require){
  'use strict';
  var angular = require('angular'),
    userContext = require('app/common/context/user'),
    config = require('app/config');
  var module = angular.module('common.services.attachment', ['app.config', 'common.context.user']);
  module.factory('attachmentFactory', ['$http', 'appConstant', '$q', 'userContext', function ($http, constant, $q, userContext){
    var services = {};

    services.attachFileToTask = function (taskId, fileId){
      return $http.patch(constant.domain + '/api/attachments/' + fileId, {
        taskId: taskId
      });
    };

    services.download = function (fileId){
      window.open(constant.domain + '/storage/attachments/' + fileId);
    };

    services.deleteAttachment = function (fileId){
      return $http.delete(constant.domain + '/api/attachments/' + fileId);
    };

    return services;
  }]);
  return module;
});