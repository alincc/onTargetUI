define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config');
  var module = angular.module('common.directives.userAvatar', ['app.config']);
  module.directive('userAvatar', ['appConstant', '$timeout', function(constant, $timeout) {
    return {
      restrict: "A",
      link: function(scope, elem, attrs) {
        attrs.$observe('src', function() {
          elem.attr('src', '');
          $timeout(function() {
            elem.attr('src', constant.resourceUrl + '/' + attrs.src);
          });
        });
      }
    };
  }
  ]);
  return module;
});
