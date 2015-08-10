define(function(require) {
  'use strict';
  var angular = require('angular');
  var module = angular.module('common.directives.uiToggleClass', []);
  module.directive('uiToggleClass', [function() {
      return {
        restrict: "AC",
        link: function(scope, elem, attrs) {
          var isOpen = false;
          elem.on("click", function(event) {
            event.preventDefault();
            var d = attrs.uiToggleClass.split(","),
              e = attrs.target && attrs.target.split(",") || new Array(elem),
              f = 0;
            angular.forEach(d, function(el) {
              var b = e[e.length && f];
              angular.element(document.querySelector(b)).toggleClass(el);
              f++;
            });
            elem.toggleClass("active");
          });

          scope.$on('$destroy', function() {
            elem.off("click");
          });
        }
      };
    }
  ]);
  return module;
});
