/**
 * Created by thophan on 8/24/2015.
 */
define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config');
  var module = angular.module('common.directives.taskAttachment', ['app.config']);
  module.directive('taskAttachment', ['appConstant', '$timeout', '$document', function(constant, $timeout, $document) {
    return {
      restrict: "A",
      link: function(scope, elem, attrs) {

        scope.$watch(function() {
          return attrs.href;
        }, function(n, o) {
            $timeout(function() {
              var fileUrl = constant.resourceUrl + attrs.href;
              var a = $document[0].createElement('a');

              a.href = fileUrl;
              elem.attr('href', fileUrl);
            });
        });
      }
    };
  }
  ]);
  return module;
});
