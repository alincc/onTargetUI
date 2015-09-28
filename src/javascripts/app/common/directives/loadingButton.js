define(function(require) {
  'use strict';
  var angular = require('angular'),
    Ladda = require('ladda'),
    module;
  module = angular.module('common.directives.loadingButton', []);
  module.directive('loadingButton', [function() {
    return {
      restrict: 'A',
      scope: {
        loadingButton: '='
      },
      link: function(scope, elem, attrs) {
        elem.attr('data-size', attrs.size || 'sm');
        elem.attr('data-style', 'expand-right');
        elem.addClass('ladda-button');
        var innerHtml = elem.html();
        elem.html('<span class="ladda-label">' + innerHtml + '</span>');
        var l = Ladda.create(elem[0]);
        scope.$watch('loadingButton', function(e) {
          console.log(l, scope.loadingButton);
          if(scope.loadingButton) {
            l.start();
          } else {
            l.stop();
          }
        });
      }
    };
  }]);
  return module;
});