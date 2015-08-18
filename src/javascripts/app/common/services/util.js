define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    countryServiceModule = require('app/common/services/country');
  var module = angular.module('common.services.util', ['app.config', 'common.services.country']);
  module.factory('utilFactory', ['countryFactory', '$q', function(countryFactory, $q) {
    var services = {};
    /**
     * @param {DOMElement} element
     * @param {string} className
     * @returns {DOMElement} The closest parent of element matching the
     * className, or null.
     */
    services.getParentWithClass = function(e, className, depth) {
      depth = depth || 10;
      while(e.parentNode && depth--) {
        if(e.parentNode.classList && e.parentNode.classList.contains(className)) {
          return e.parentNode;
        }
        e = e.parentNode;
      }
      return null;
    };
    /**
     * @param {DOMElement} element
     * @param {string} className
     * @returns {DOMElement} The closest parent or self matching the
     * className, or null.
     */
    services.getParentOrSelfWithClass = function(e, className, depth) {
      depth = depth || 10;
      while(e && depth--) {
        if(e.classList && e.classList.contains(className)) {
          return e;
        }
        e = e.parentNode;
      }
      return null;
    };

    services.newGuid = function() {
      function guid() {
        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
          s4() + '-' + s4() + s4() + s4();
      }

      return guid();
    };

    services.getFileExtension = function(filePath) {
      return filePath.substr(filePath.lastIndexOf('.') + 1);
    };

    services.generateAddress = function(addrObj) {
      var address = '', state, country, deferred = $q.defer();

      function cont() {
        if(addrObj.address1) {
          address += addrObj.address1 + ', ';
        }
        if(addrObj.city) {
          address += addrObj.city + ', ';
        }
        if(state) {
          address += state.name + ', ';
        }
        if(country) {
          address += country.name + ' ';
        }
        if(addrObj.zip) {
          address += addrObj.zip;
        }
        deferred.resolve(address);
      }
      if(addrObj.country) {
        country = countryFactory.getCountryByCode(addrObj.country);
      }

      if(country && addrObj.state) {
        countryFactory.getStateByCode(country.filename, addrObj.state)
          .then(function(resp) {
            state = resp;
            cont();
          }, cont);
      }



      if(addrObj.country) {
        country = countryFactory.getCountryByCode(addrObj.country);
      }

      if(country && addrObj.state) {
        countryFactory.getStateByCode(country.filename, addrObj.state)
          .then(function(resp) {
            state = resp;
            cont();
          }, cont);
      }

      if(addrObj.country) {
        country = countryFactory.getCountryByCode(addrObj.country);
      }

      if(country && addrObj.state) {
        countryFactory.getStateByCode(country.filename, addrObj.state)
          .then(function(resp) {
            state = resp;
            cont();
          }, cont);
      }

      return deferred.promise;
    };

    return services;
  }]);
  return module;
});