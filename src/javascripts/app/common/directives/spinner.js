define(function(require) {
  'use strict';
  var angular = require('angular'),
    module;
  module = angular.module('common.directives.spinner', []);
  module.directive('spinner', ['$timeout', function($timeout) {
    return {
      restrict: 'E',
      template: '<i class="fa fa-spin fa-spinner"></i> {{loadingText}}',
      link: function(scope, elem, attrs) {
        scope.loadingText = attrs.text || '';
      }
    };
  }]);
  return module;
});