define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config');
  var module = angular.module('common.services.user', ['app.config']);
  module.factory('userFactory', ['$http', 'appConstant', '$q', function($http, constant, $q) {
    var services = {};

    services.search = function(query, max, canceler) {
      max = max || 5;
      var params = {
        query: query,
        max: max
      };
      return $http.get(constant.domain + '/api/Users', {params: params, timeout: canceler});
    };

    services.getById = function(id) {
      return $http.get(constant.domain + '/api/Users/' + id);
    };

    return services;
  }]);
  return module;
});