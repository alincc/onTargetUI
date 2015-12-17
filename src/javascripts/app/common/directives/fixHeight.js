define(function(require) {
  'use strict';
  var angular = require('angular');
  var module = angular.module('common.directives.fixHeight', []);
  module.directive('fixHeight', [function() {
    return {
      restrict: "A",
      link: function(scope, elem, attrs) {
        var headerHeight = 177;
        var exclHeight = headerHeight + parseInt(attrs.fixHeight || 0);
        console.log(headerHeight, parseInt(attrs.fixHeight || 0), exclHeight);
        elem.css('height', (window.innerHeight - exclHeight) + 'px');
      }
    };
  }
  ]);
  return module;
});
