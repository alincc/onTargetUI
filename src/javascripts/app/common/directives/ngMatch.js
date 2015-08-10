define([
  'angular'
], function(angular) {
  'use strict';
  var module = angular.module('common.directives.ngMatch', []);
  module.directive('ngMatch', [function() {
    return {
      require: "ngModel",
      scope: {
        otherModelValue: "=ngMatch"
      },
      link: function (scope, element, attributes, ngModel) {
        ngModel.$validators.ngMatch = function (modelValue) {
          return modelValue === scope.otherModelValue;
        };

        scope.$watch("otherModelValue", function () {
          ngModel.$validate();
        });
      }
    };
  }]);
  return module;
});