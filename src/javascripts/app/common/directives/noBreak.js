define(function (require){
  'use strict';
  var angular = require('angular'),
    module = angular.module('common.directives.noBreak', []);

  module.directive('noBreak', [function (){
    return {
      restrict: "A",
      link: function (scope, elem, attrs){
        elem.on('keypress', function (event){
          if (event.keyCode === 10 || event.keyCode === 13) {
            event.preventDefault();
          }
        });

        scope.$on('$destroy', function (){
          elem.off('keypress');
        });
      }
    };
  }]);

  return module;
});