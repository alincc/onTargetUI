define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    fileupload = require('ngFileUpload');
  var module = angular.module('common.services.onSite', ['app.config', 'ngFileUpload']);
  module.factory('onSiteFactory', ['$http', 'appConstant', 'Upload', function($http, constant, Upload) {
    var services = {};

    services.parseXls = function(file) {
      return Upload.upload({
        url: constant.nodeServer + '/node/xls-parser',
        file: file,
        headers: {
          'Authorization': false
        }
      });
    };

    services.getFileComment = function(fileId) {
      return $http.post(constant.domain + '/upload/projectFileCommentList', {
        projectFileId: fileId
      });
    };

    services.addComment = function(fileId, comment, fileName, fileOwnerId) {
      return $http.post(constant.domain + '/upload/addComment', {
        projectFileId: fileId,
        commentId: null,
        comment: comment,
        fileName: fileName,
        fileOwnerId: fileOwnerId
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

    services.deleteDocument = function(projectFileId) {
      return $http.post(constant.domain + '/upload/delete', {
        projectFileId: projectFileId
      });
    };

    services.addTagComment = function(id, comment) {
      return $http.post(constant.domain + '/project/file/tag/comment/add', {
        "comment": comment,
        "projectFileTagId": id
      });
    };

    services.addTags = function(tags) {
      return $http.post(constant.domain + '/project/file/tag/save', {
        tags: tags
      });
    };

    services.getTagsByDocument = function(id) {
      return $http.post(constant.domain + '/project/file/tag/get', {
        "projectFileId": id
      });
    };

    services.exportPdf = function(data) {
      return $http.post(constant.nodeServer + '/node/onsite/exportPdf', data);
    };

    services.getNextVersionName = function(path){
      return $http.post(constant.nodeServer + '/node/onsite/getNextVersionName', {
        path: path
      });
    };

    return services;
  }]);
  return module;
});