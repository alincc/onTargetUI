define(function(require) {
  'use strict';
  var angular = require('angular');
  var directive = [function() {
    return {
      restrict: 'A',
      link: function(scope, elem, attrs) {
        elem.css('max-width', (window.innerWidth / 2) - 340 + 'px');
      }
    };
  }];
  return directive;
});