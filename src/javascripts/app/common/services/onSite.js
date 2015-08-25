define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config');
  var module = angular.module('common.services.onSite', ['app.config']);
  module.factory('onSiteFactory', ['$http', 'appConstant', '$q', function($http, constant, $q) {
    var services = {};

    services.getFileComment = function(fileId) {
      return $http.post(constant.domain + '/upload/projectFileCommentList', {
        projectFileId: fileId
      });
    };

    services.addComment = function(fileId, comment) {
      return $http.post(constant.domain + '/upload/addComment', {
        projectFileId: fileId,
        commentId: null,
        comment: comment
      });
    };

    services.editComment = function(fileId, commentId, comment) {
      return $http.post(constant.domain + '/upload/addComment', {
        projectFileId: fileId,
        commentId: commentId,
        comment: comment
      });
    };

    services.deleteComment = function(commentId) {
      return $http.post(constant.domain + '/upload/deleteComment', {
        commentId: commentId
      });
    };

    return services;
  }]);
  return module;
});