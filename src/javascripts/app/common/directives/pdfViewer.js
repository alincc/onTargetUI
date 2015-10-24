define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config');
  var module = angular.module('common.directives.pdfViewer', [
    'app.config'
  ]);
  module.directive('pdfViewer', function() {
    return {
      restrict: 'E',
      //replace: true,
      template: '<embed width="100%" height="100%" alt="pdf" pluginspage="http://www.adobe.com/products/acrobat/readstep2.html">',
      scope: {
        src: '@'
      },
      link: function(scope, element, attrs) {
        //element.replaceWith('<object width="100%" height="100%" type="application/pdf" data="' + url + '"></object>');
        var current = element.children();
        scope.$watch('src', function() {
          if(scope.src){
            var clone = element
              .children()
              .clone()
              .attr('src', scope.src);
            current.replaceWith(clone);
            current = clone;
          }
        });
      }
    };
  });

  return module;
});

