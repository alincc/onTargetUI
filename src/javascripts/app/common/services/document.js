/**
 * Created by thophan on 8/19/2015.
 */
define(function(require) {
  'use strict';
  var angular = require('angular'),
    module;

  module = angular.module('common.services.document', ['app.config']);

  module.factory('documentFactory',
    ['appConstant', '$http',
      function(constant, $http) {
        var service = {};
        service.getUserDocument = function(projectId) {
          return $http.post(constant.domain + '/documents/getUserDocument', {
            projectId: projectId
          });
        };

        service.getDocumentById = function(docId) {
          return $http.post(constant.domain + '/documents/getDocument', {
            dcoumentId: docId
          });
        };

        service.getUploadedDocumentList = function(projectId) {
          return $http.post(constant.domain + '/upload', {
            projectId: projectId
          });
        };

        service.getCategories = function() {
          return $http.post(constant.domain + '/upload/projectFileCategoryList', {});
        };

        service.saveUploadedDocsInfo = function(data) {
          return $http.post(constant.domain + '/upload/saveUploadedDocsInfo', data);
        };

        return service;
      }
    ]
  );
});