define([
  'angular'
], function(angular) {
  'use strict';
  var module = angular.module('common.validators.number', []);
  module.directive('ngNumber', function() {
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function(scope, elem, attrs, ngModel) {
        ngModel.$validators.number = function(value) {
          var valid = /^\d+$/.test(value);
          return valid;
        };

        ngModel.$validators.numberMin = function(value) {
          var valid = /^\d+$/.test(value);
          if (valid) {
            if(attrs.min && value < parseInt(attrs.min,10)){
              valid = false;
            }
          }
          return valid;
        };

        ngModel.$validators.numberMax = function(value) {
          var valid = /^\d+$/.test(value);
          if (valid) {
            if(attrs.max  && value > parseInt(attrs.max,10)){
              valid = false;
            }
          }
          return valid;
        };

        ngModel.$validators.numberMinLength = function(value) {
          var valid = /^\d+$/.test(value);
          if (valid) {
            if(attrs.minLength && value.length < parseInt(attrs.minLength,10)){
              valid = false;
            }
          }
          return valid;
        };

        ngModel.$validators.numberMaxLength = function(value) {
          var valid = /^\d+$/.test(value);
          if (valid) {
            if(attrs.maxLength && value.length > parseInt(attrs.maxLength,10)){
              valid = false;
            }
          }
          return valid;
        };
      }
    };
  });
  return module;
});