define(function(require) {
  'use strict';
  var angular = require('angular'),
    tpl = require('text!./templates/taskInfo.html'),
    module;
  module = angular.module('common.directives.taskInfo', []);

  module.run([
    '$templateCache',
    function($templateCache) {
      $templateCache.put('taskInfo/templates/taskInfo.html', tpl);
    }]);

  module.directive('taskInfo', [function() {
    return {
      restrict: 'E',
      scope: {
        task: '=task'
      },
      templateUrl: 'taskInfo/templates/taskInfo.html',
      controller: [
        '$scope',
        '$rootScope',
        function($scope,
                 $rootScope) {

        }],
      link: function() {

      }
    };
  }]);
  return module;
});