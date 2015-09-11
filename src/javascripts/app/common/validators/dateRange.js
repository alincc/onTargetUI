define(function(require){
  'use strict';
  var angular = require('angular'),
    moment = require('moment');

  var module = angular.module('common.validators.dateRange', []);
  module.directive('dateRange', ['$parse', function($parse){
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel){
        ngModel.$validators.gtMaxDate = function(modelValue){
          if(attrs.minDate) {
            var maxDateValue = angular.copy($parse(attrs.minDate)(scope));
            return moment(modelValue).isValid() && moment(maxDateValue).isValid() && moment(modelValue).diff(moment(maxDateValue), 'days') >= 0;
          }
          return false;
        };

        ngModel.$validators.ltMinDate = function(modelValue){
          if(attrs.maxDate) {
            var minDateValue = angular.copy($parse(attrs.maxDate)(scope));
            return moment(modelValue).isValid() && moment(minDateValue).isValid() && moment(minDateValue).diff(moment(modelValue), 'days') >= 0;
          }
          return false;
        };
      }
    };
  }]);
  return module;
});