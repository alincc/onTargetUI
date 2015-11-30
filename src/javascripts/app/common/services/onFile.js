define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    shippingMethod = require('text!app/common/resources/shippingMethod.json'),
    documentTemplate = require('text!app/common/resources/documentTemplate.json'),
    disciplines = require('text!app/common/resources/disciplines.json'),
    categories = require('text!app/common/resources/categories.json'),
    onFileItems = require('text!app/common/resources/onFileItems.json'),
    submittedFor = require('text!app/common/resources/submittedFor.json'),
    actionAsNoted = require('text!app/common/resources/actionsAsNoted.json'),
    impact = require('text!app/common/resources/impact.json');
  var module = angular.module('common.services.onFile', ['app.config']);
  module.factory('onFileFactory', ['$http', 'appConstant', function($http, constant) {
    var services = {};

    services.getShippingMethod = function() {
      return angular.fromJson(shippingMethod);
    };

    services.getDocuments = function(userName) {
      return $http.get(constant.domain + '/documents?userName=' + userName);
      //return $http.get(constant.baseUrl + '/ontargetrsbeta/services/document?userName=' + userName);
    };

    services.getDocumentTemplateId = function() {
      return angular.fromJson(documentTemplate);
    };

    services.addNewDocument = function(model) {
      return $http.put(constant.domain + '/document', model, {
        headers: {
          AutoAlert: true
        }
      });
    };

    services.updateDocument = function(model) {
      return $http.post(constant.domain + '/document', model, {
        headers: {
          AutoAlert: true
        }
      });
    };

    services.getDisciplines = function() {
      return angular.fromJson(disciplines);
    };

    services.getCategories = function() {
      return angular.fromJson(categories);
    };

    services.addAttachment = function(model) {
      return $http.put(constant.domain + '/document/attachment/save', model);
    };

    services.deleteAttachment = function(id) {
      return $http.put(constant.domain + '/document/attachment/delete', {
        documentAttachmentId: id
      });
    };

    services.getItems = function() {
      return angular.fromJson(onFileItems);
    };

    services.getDocumentById = function(documentId) {
      return $http.post(constant.domain + '/document/getDocument', {dcoumentId: documentId});
    };

    services.updateStatus = function(documentId, newStatus, modifiedBy) {
      return $http.post(constant.domain + '/document/status', {
        "documentId": documentId,
        "newStatus": newStatus,
        "modifiedBy": modifiedBy
      });
    };

    services.getSubmittedFor = function() {
      return angular.fromJson(submittedFor);
    };

    services.getActionAsNoted = function() {
      return angular.fromJson(actionAsNoted);
    };

    services.addResponse = function(response, documentId) {
      return $http.put(constant.domain + '/document/response/save', {
        documentId: documentId,
        response: response
      });
    };

    services.getResponse = function(documentId) {
      return $http.post(constant.domain + '/document/response', {
        documentId: documentId
      });
    };

    services.updateResponse = function(responseId, response) {
      return $http.post(constant.domain + '/document/response/update', {
        "documentResponseId": responseId,
        "response": response
      });
    };

    services.deleteResponse = function(resId) {
      return $http.post(constant.domain + '/document/response/delete', {
        documentResponseId: resId
      });
    };

    services.exportPdf = function(url) {
      return $http.get(constant.nodeServer + '/node/exportPdf');
    };

    services.getImpacts = function() {
      return angular.fromJson(impact);
    };

    services.getDocumentAttachmentsByDocumentId = function(documentId) {
      return $http.post(constant.domain + '/document/attachment/getAll', {
        documentId: documentId
      });
    };

    services.exportPdf = function(data) {
      return $http.post(constant.nodeServer + '/node/onfile/export', data);
    };

    return services;
  }]);
  return module;
});