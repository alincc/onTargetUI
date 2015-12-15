define(function(require) {
  'use strict';
  var angular = require('angular');
  var module = angular.module('common.directives.fixHeight', []);
  module.directive('fixHeight', [function() {
    return {
      restrict: "A",
      link: function(scope, elem, attrs) {
        var exclHeight = parseInt(attrs.fixHeight || 177);
        elem.css('height', window.innerHeight - exclHeight + 'px');
      }
    };
  }
  ]);
  return module;
});
