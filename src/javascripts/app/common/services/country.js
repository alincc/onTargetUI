define(function(require) {
  'use strict';
  var angular = require('angular'),
    module,
    countryListData = require('text!app/common/resources/countries.json');

  module = angular.module('common.services.country', []);

  module.factory('countryFactory',
    ['$http',
      function($http) {
        var service = {};
        service.getCountryList = function() {
          var countryListJson = angular.fromJson(countryListData);
          return countryListJson;
        };

        service.getStateList = function(fileName) {
          return $http.get('javascripts/app/common/resources/countries/' + fileName + '.json');
        };

        return service;
      }
    ]
  );
});