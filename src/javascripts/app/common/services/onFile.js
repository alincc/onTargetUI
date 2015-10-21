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

    services.getShippingMethod = function (){
      return angular.fromJson(shippingMethod);
    };

    services.getDocuments = function (userName){
      return $http.get(constant.domain + '/documents?userName=' + userName);
      //return $http.get(constant.baseUrl + '/ontargetrsbeta/services/document?userName=' + userName);
    };

    services.getDocumentTemplateId = function (){
      return angular.fromJson(documentTemplate);
    };

    services.addNewDocument = function (model){
      return $http.put(constant.domain + '/document', model);
    };

    services.getDisciplines = function (){
      return angular.fromJson(disciplines);
    };

    services.getCategories = function (){
      return angular.fromJson(categories);
    };
    
    services.addAttachment = function (model){
      return $http.put(constant.domain + '/document/attachments', model);
    };
    
    services.getItems = function (){
      return angular.fromJson(onFileItems);
    };
    
    services.getDocumentById = function (documentId){
      return $http.post(constant.domain + '/document/getDocument', {dcoumentId: documentId});
    };

    services.updateStatus = function (documentId, newStatus, modifiedBy){
      return $http.post(constant.domain + '/document/status', {
        "documentId" : documentId,
        "newStatus" : newStatus,
        "modifiedBy" : modifiedBy});
    };

    services.getSubmittedFor = function (){
      return angular.fromJson(submittedFor);
    };

    services.getActionAsNoted = function (){
      return angular.fromJson(actionAsNoted);
    };

    services.addResponse = function (response, documentId){
      return $http.put(constant.domain + '/document/response/save', {
        documentId: documentId,
        response: response
      });
    };

    services.getResponse = function (documentId){
      return $http.post(constant.domain + '/document/response',{
        documentId: documentId
      });
    };

    services.updateResponse = function (responseId, response){
      return $http.post(constant.domain + '/document/response/update',{
        "documentResponseId" : responseId,
        "response" : response
      });
    };

    services.deleteResponse = function (resId){
      return $http.post(constant.domain + '/document/response/delete',{
        documentResponseId: resId
      });
    };

    services.exportPdf = function (url){
      return $http.get('http://localhost:9001/node/exportPdf');
    };

    services.getImpacts = function (){
      return angular.fromJson(impact);
    };
    
    services.getAttachmentById = function (documentId){
      return $http.get(constant.domain + '/document/' + documentId + '/attachments');
    };

    return services;
  }]);
  return module;
});