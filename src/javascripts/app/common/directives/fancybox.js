define(function(require) {
  'use strict';
  var angular = require('angular'),
    jstree = require('jstree'),
    jQuery = require('jQuery'),
    fancybox = require('fancybox'),
    module;
  module = angular.module('common.directives.fancybox', []);
  module.directive('fancybox', [
    '$timeout',
    function($timeout) {
      return {
        restrict: 'AEC',
        scope: {
          data: '='
        },
        link: function(scope, elem, attrs) {
          jQuery(".fancybox").fancybox({

          });
        }
      };
    }]);
  return module.name;
});