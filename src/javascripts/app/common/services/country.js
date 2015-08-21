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
            if(savedState.isGetting) {
              savedState.defers.push(deferred);
            } else {
              deferred.resolve(savedState.states);
            }
          } else {
            service.savedDate.states.push({
              fileName: fileName,
              states: [],
              isGetting: true,
              defers: []
            });

            $http.get('javascripts/app/common/resources/countries/' + fileName + '.json')
              .success(function(resp) {
                var cState = _.where(service.savedDate.states, {fileName: fileName})[0];
                cState.isGetting = false;
                cState.states = resp;
                _.each(cState.defers, function(d) {
                  d.resolve(resp);
                });
                cState.defers = [];
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
            var state = _.where(resp, {code: code})[0];
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