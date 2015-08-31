/**
 * Created by thophan on 8/31/2015.
 */
define(function (require){
  'use strict';
  var angular = require('angular'),
    module = angular.module('common.validators.requireMultiple', []);

  module.directive('requireMultiple', [function (){
    return {
      require: 'ngModel',
      link: function postLink(scope, element, attrs, ngModel) {
        ngModel.$validators.required = function (value) {
          return angular.isArray(value) && value.length > 0;
        };
      }
    };
  }]);

  return module;
});