define(function (require){
  'use strict';
  var angular = require('angular'),
    autosize = require('autosize'),
    module;
  module = angular.module('common.directives.autoGrow', []);
  module.directive('autoGrow', ['$timeout', function ($timeout){
    return function (scope, element){
      var ta = autosize(element[0]);

      scope.$on('autosize:update', function(){
        $timeout(function(){
          autosize.update(ta);
        });
      });
    };
  }]);
  return module;
});