define(function(require) {
  'use strict';
  var angular = require('angular'),
    module;
  module = angular.module('common.directives.autoFocus', []);
  module.directive('autoFocus', ['$timeout', function($timeout) {
    return {
      restrict: 'A',
      link: function(scope, elem, attrs) {
        var delayTime = attrs.autoFocus ? parseInt(attrs.autoFocus) : 150;
        $timeout(function() {
          elem[0].focus();
        }, delayTime);
      }
    };
  }]);
  return module;
});