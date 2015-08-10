define(function(require) {
  'use strict';
  var angular = require('angular'),
    userContext = require('app/common/context/user'),
    config = require('app/config');
  var module = angular.module('common.services.comment', ['app.config', 'common.context.user']);
  module.factory('commentFactory', ['$http', 'appConstant', '$q', 'userContext', function($http, constant, $q, userContext) {
    var services = {};

    services.addComment = function(taskId, comment){
      return $http.post(constant.domain + '/api/tasks/' + taskId + '/comment', {
        text: comment
      });
    };

    return services;
  }]);
  return module;
});