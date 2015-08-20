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
        service.savedDate = {
          countries: null,
          states: []
        };
        service.getCountryList = function() {
          if(service.savedDate.countries) {
            return service.savedDate.countries;
          } else {
            var countryListJson = angular.fromJson(countryListData);
            service.savedDate.countries = countryListJson;
            return countryListJson;
          }
        };

        service.getStateList = function(fileName) {
          var deferred = $q.defer();
          var savedState = _.where(service.savedDate.states, {fileName: fileName})[0];
          if(savedState) {
            deferred.resolve(savedState.states);
          } else {
            $http.get('javascripts/app/common/resources/countries/' + fileName + '.json')
              .success(function(resp) {
                service.savedDate.states.push({
                  fileName: fileName,
                  states: resp
                });
                deferred.resolve(resp);
              })
              .error(function() {
                deferred.resolve([]);
              });
          }
          return deferred.promise;
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