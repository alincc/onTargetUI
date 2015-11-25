define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    utilServiceModule = require('app/common/services/util'),
    fileupload = require('ngFileUpload');
  var module = angular.module('common.services.onSite', ['app.config', 'ngFileUpload', 'common.services.util']);
  module.factory('onSiteFactory', [
    '$http',
    'appConstant',
    'Upload',
    'utilFactory',
    function($http,
             constant,
             Upload,
             utilFactory) {
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

      services.addComment = function(fileId, comment, fileName, fileOwnerId, currentDate) {
        return $http.post(constant.domain + '/upload/addComment', {
          projectFileId: fileId,
          commentId: null,
          comment: comment,
          fileName: fileName,
          fileOwnerId: fileOwnerId,
          commentedDate: currentDate
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

      services.exportPdf = function(docId, projectId, data) {
        return $http.post(constant.nodeServer + '/node/onsite/exportPdf', {
          docId: docId,
          projectId: projectId,
          data: data
        });
      };

      services.getPdfImagePages = function(path) {
        return $http.post(constant.nodeServer + '/node/onsite/getPdfImages', {
          path: path
        });
      };

      services.getNextVersionName = function(path, totalVersions) {
        return $http.post(constant.nodeServer + '/node/onsite/getNextVersionName', {
          path: path,
          totalVersions: totalVersions
        });
      };

      services.getDocumentTags = function(projectFileId) {
        return $http.post(constant.domain + '/project/file/tag/get', {
          "projectFileId": projectFileId
        });
      };

      services.getDocumentZoomLevel = function(path) {
        return $http.post(constant.nodeServer + '/node/onsite/getZoomLevel', {
          path: path
        });
      };

      services.checkFileStatus = function(path) {
        return $http.post(constant.nodeServer + '/node/onsite/checkFileStatus', {
          path: path
        });
      };

      services.updateDocumentConversionStatus = function(docId, status) {
        return $http.post(constant.domain + '/upload/updateConversionComplete', {
          projectFileId: docId,
          isConversionComplete: status
        });
      };

      services.downloadFile = function(docId, projectId) {
        return $http.post(constant.nodeServer + '/node/onsite/downloadFile', {
          id: utilFactory.hash(docId.toString()),
          projectId: projectId
        });
      };

      return services;
    }]);
  return module;
});