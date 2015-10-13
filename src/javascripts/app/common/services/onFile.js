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
    actionAsNoted = require('text!app/common/resources/actionsAsNoted.json');
  var module = angular.module('common.services.onFile', ['app.config']);
  module.factory('onFileFactory', ['$http', 'appConstant', function($http, constant) {
    var services = {};

    services.getShippingMethod = function (){
      return angular.fromJson(shippingMethod);
    };

    services.getDocuments = function (userName){
      //return $http.get(constant.domain + '/documents?userName=' + userName);
      return $http.get(constant.baseUrl + '/ontargetrsbeta/services/documents?userName=' + userName);
    };

    services.getDocumentTemplateId = function (){
      return angular.fromJson(documentTemplate);
    };

    services.addNewDocument = function (model){
      return $http.post(constant.domain + '/documents', model);
    };

    services.getDisciplines = function (){
      return angular.fromJson(disciplines);
    };

    services.getCategories = function (){
      return angular.fromJson(categories);
    };
    
    services.addAttachment = function (model){
      return $http.post(constant.domain + '/documents/attachments', model);
    };
    
    services.getItems = function (){
      return angular.fromJson(onFileItems);
    };
    
    services.getDocument = function (documentId){
      return $http.post(constant.domain + '/documents/getDocument', {documentId: documentId});
    };

    services.updateStatus = function (documentId, newStatus, modifiedBy){
      return $http.post(constant.domain + '/documents/status', {
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
      return $http.post(constant.domain + '/document/response/save', {response: response, documentId: documentId});
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

    return services;
  }]);
  return module;
});