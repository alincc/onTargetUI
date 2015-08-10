/* istanbul ignore next */
// We will be using backend-less development
// $http uses $httpBackend to make its calls to the server
// $resource uses $http, so it uses $httpBackend too
// We will mock $httpBackend, capturing routes and returning data
define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    angularMocks = require('angularMocks'),
    angularResource = require('angularResource'),
    module;

  module = angular.module('common.services.mock', ['ngMockE2E', 'app.config', 'ngResource']);

  module.run(["$httpBackend", 'appConstant', '$resource', function($httpBackend, constant, $resource) {

    //// Ignore html files
    //$httpBackend.whenGET(/^.*\.html$/).passThrough();
    //
    //// Ignore json files
    //$httpBackend.whenGET(/.*\.json$/).passThrough();
    //
    //// Ignore image files
    //$httpBackend.whenGET(/.*\.jpg$/).passThrough();
    //
    //// Ignore GET request
    //$httpBackend.whenGET(function(str) {
    //  if (str.indexOf(constant.domain) > -1) {
    //    return true;
    //  }
    //  return false;
    //}).passThrough();
    //
    //// Ignore POST request
    //$httpBackend.whenPOST(function(str) {
    //  if (str.indexOf(constant.domain) > -1) {
    //    return true;
    //  }
    //  return false;
    //}).passThrough();
    //
    //// Ignore DELETE request
    //$httpBackend.whenDELETE(function(str) {
    //  if (str.indexOf(constant.domain) > -1) {
    //    return true;
    //  }
    //  return false;
    //}).passThrough();
    //
    //// Ignore https POST request
    //$httpBackend.whenPOST(function(str) {
    //  if (str.indexOf('https://') > -1) {
    //    return true;
    //  }
    //  return false;
    //}).passThrough();
    //
    //$httpBackend.whenGET(/\/api\/searchitems/).respond(function(method, url, data) {
    //  var result = angular.fromJson(mockData);
    //
    //  var total = 0;
    //  var q = querySt("q", url), page = querySt("page", url), per_page = querySt("per_page", url);
    //
    //  if (q) {
    //    result = result.filter(function(el) {
    //      return el.item_code.toUpperCase().indexOf(q.toUpperCase()) > 0;
    //    });
    //  }
    //
    //  total = result.length;
    //  result = result.slice(per_page * (page - 1), per_page * (page - 1) + parseInt(per_page));
    //
    //  var results = {
    //    page: page,
    //    per_page: per_page,
    //    total: total,
    //    count: result.length,
    //    results: result
    //  };
    //  return [200, results, {}];
    //});
    //
    //$httpBackend.whenGET(/\/api\/replacements/).respond(function(method, url, data) {
    //  var result = angular.fromJson(replacementData);
    //
    //  var total = 0;
    //  var itemId = querySt("itemId", url), page = querySt("page", url), per_page = querySt("per_page", url);
    //
    //  total = result.results.length;
    //  result.results = result.results.slice(per_page * (page - 1), per_page * (page - 1) + parseInt(per_page,10));
    //
    //  var results = {
    //    page: page,
    //    per_page: per_page,
    //    total: total,
    //    count: result.results.length,
    //    results: result
    //  };
    //  return [200, results, {}];
    //});
  }]);
  // Not used currently
  return module;
});


