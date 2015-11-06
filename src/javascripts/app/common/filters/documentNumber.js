define(function(require) {
  'use strict';

  var angular = require('angular'),
    _ = require('lodash'),
    module = angular
      .module('common.filters.documentNumber', [])
      .filter('documentNumber', function() {
        return function(document){
          switch(document.documentTemplate.name) {
            default:
            case 'Change Order': {
              return _.result(_.find(document.keyValues, function(keyValue) {
                return keyValue.key.toLowerCase() === 'co';
              }), 'value');
            }
            case 'Request For Information' : {
              return _.result(_.find(document.keyValues, function(keyValue) {
                return keyValue.key.toLowerCase() === 'rfi';
              }), 'value');
            }
            case 'Purchase Order': {
              return _.result(_.find(document.keyValues, function(keyValue) {
                return keyValue.key.toLowerCase() === 'po';
              }), 'value');
            }
            case 'Transmittal' : {
              return _.result(_.find(document.keyValues, function(keyValue) {
                return keyValue.key.toLowerCase() === 'transmittal';
              }), 'value');
            }
          }
        };
      });

  return module;
});