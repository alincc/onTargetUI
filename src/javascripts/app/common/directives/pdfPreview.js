define(function(require) {
  'use strict';
  var angular = require('angular'),
  config = require('app/config');
  var module = angular.module('common.directives.pdfPreview', ['app.config']);
  module.directive('pdf', function() {
    return {
      restrict: 'E',
      //replace: true,
      template:'<embed width="100%" height="100%" alt="pdf" pluginspage="http://www.adobe.com/products/acrobat/readstep2.html">',
      scope: {
        src: '@'
      },
      link: function(scope, element, attrs) {
        //element.replaceWith('<object width="100%" height="100%" type="application/pdf" data="' + url + '"></object>');
        var current = element.children();
        console.log(current);
        scope.$watch('src', function () {
          var clone = element
            .children()
            .clone()
            .attr('src', attrs.src);
          current.replaceWith(clone);
          current = clone;
        });
      }
    };
  });

  return module;
});

