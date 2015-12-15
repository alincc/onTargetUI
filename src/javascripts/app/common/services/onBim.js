define(function(require) {
  'use strict';
  var angular = require('angular'),
    angularLocalStorage = require('angularLocalStorage'),
    module;

  module = angular.module('common.services.onBim', [
    'app.config',
    'angularLocalStorage'
  ]);

  module.factory('onBimFactory', [
      'appConstant',
      '$http',
      '$q',
      'storage',
      'Upload',
      function(constant,
               $http,
               $q,
               storage,
               Upload) {
        var service = {};

        service.getAllProjects = function(projectId) {
          return $http.post(constant.domain + '/bim/getAll', {projectId: projectId});
        };

        service.addProject = function(data) {
          return $http.post(constant.domain + '/bim/save', data);
        };

        service.uploadIfc = function(file, projectAssetFolderName, data, newFileName) {
          newFileName = newFileName || file.name;
          return Upload.upload({
            url: constant.newBimServer + '/bim/upload',
            file: file,
            fields: {
              'fileName': newFileName,
              'data': data,
              'projectAssetFolderName': projectAssetFolderName
            },
            headers: {
              'Authorization': false
            }
          });
        };

        service.addComment = function(projectBIMFileId, comment) {
          return $http.post(constant.domain + '/bim/comment/save', {
            projectBIMFileId: projectBIMFileId,
            comment: comment
          });
        };

        service.updateComment = function(projectBIMFileId, comment, commentId) {
          return $http.post(constant.domain + '/bim/comment/save', {
            projectBIMFileId: projectBIMFileId,
            comment: comment,
            commentId: commentId
          });
        };

        service.getCommentList = function(projectBIMFileId) {
          return $http.post(constant.domain + '/bim/comment/list', {
            projectBIMFileId: projectBIMFileId
          });
        };

        service.deleteComment = function(commentId) {
          return $http.post(constant.domain + '/bim/comment/delete', {
            commentId: commentId
          });
        };

        service.deleteProject = function(projectId) {
          return $http.post(constant.domain + '/bim/delete', {
            projectBimFileId: projectId
          }, {
            headers: {
              AutoAlert: true
            }
          });
        };

        service.updateProject = function(data) {
          return $http.post(constant.domain + '/bim/save', data);
        };

        service.getById = function(id) {
          return $http.post(constant.domain + '/bim/get', {
            "projectBimFileId": id
          });
        };

        service.getChunks = function(jsonPath){
          return $http.post(constant.newBimServer + '/bim/getChunks', {
            "json": jsonPath
          });
        };

        return service;
      }]
  );
  return module;
});
