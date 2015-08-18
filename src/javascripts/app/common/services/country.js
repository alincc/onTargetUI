define(function(require) {
  'use strict';
  var angular = require('angular'),
    lodash = require('lodash'),
    module,
    countryListData = require('text!app/common/resources/countries.json');

  module = angular.module('common.services.country', []);

  module.factory('countryFactory',
    ['$http', '$q',
      function($http, $q) {
        var service = {};
        service.getCountryList = function() {
          var countryListJson = angular.fromJson(countryListData);
          return countryListJson;
        };

        service.getStateList = function(fileName) {
          return $http.get('javascripts/app/common/resources/countries/' + fileName + '.json');
        };

        service.getCountryByCode = function(code) {
          var list = service.getCountryList();
          return _.where(list, {code: code})[0];
        };

        service.getStateByCode = function(fileName, code) {
          var deferred = $q.defer();
          var list = service.getStateList(fileName).then(function(resp) {
            var state = _.where(resp.data, {code: code})[0];
            deferred.resolve(state);
          }, function() {
            deferred.reject();
          });
          return deferred.promise;
        };

        return service;
      }
    ]
  );
});