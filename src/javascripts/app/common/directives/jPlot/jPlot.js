define(function(require) {
  'use strict';
  var angular = require('angular'),
    jQuery = require('jQuery'),
    jPlotPie = require('jPlotPie'),
    jPlotResize = require('jPlotResize'),
    jPlotCategories = require('jPlotCategories'),
    jPlotToolTip = require('jPlotToolTip'),
    jPlotOrderBar = require('jPlotOrderBar'),
    jPlotSpline = require('jPlotSpline'),
    module;
  module = angular.module('common.directives.jPlot', []);
  module.directive('jPlot', [function() {
    return {
      restrict: 'A',
      scope: {
        data: '=data',
        options: '=options'
      },
      link: function(scope, elem, attrs) {
        scope.$watch('data', function(e) {
          if(e){
            jQuery.plot(elem, angular.fromJson(scope.data), angular.fromJson(scope.options));
          }
        });
      }
    };
  }]);
  return module;
});