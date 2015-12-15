define(function(require) {
  'use strict';
  var angular = require('angular'),
    jstree = require('jstree'),
    module;
  module = angular.module('common.directives.treeView', []);
  module.directive('treeView', [
    '$timeout',
    function($timeout) {
      return {
        restrict: 'E',
        scope: {
          data: '='
        },
        link: function(scope, elem, attrs) {
          elem.jstree({
            'core': {
              'data': scope.data
            }
          });


          scope.$on('treeView.update', function(){
            elem.jstree(true).refresh();
          });
        }
      };
    }]);
  return module.name;
});