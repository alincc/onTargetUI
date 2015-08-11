define(function(require) {
  'use strict';
  var angular = require('angular'),
  //jQuery = require('jQuery'),
    module;
  module = angular.module('common.directives.loadingBar', []);
  module.directive('loadingBar', [function() {
    return {
      restrict: 'A',
      template: '<div class="meter"><span></span></div>',
      link: function(scope, elem, attrs) {
        var $meter = elem.find('.meter');
        var $bar = elem.find('.meter span');
        attrs.$observe('loadingBar', function(n) {
          $bar.css('width', n + '%');
        });
      }
    };
  }]);
  return module;
});