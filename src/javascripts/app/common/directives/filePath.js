define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config');
  var module = angular.module('common.directives.filePath', ['app.config']);
  module.directive('filePath', ['appConstant', '$timeout', '$document', function(constant, $timeout, $document) {
    return {
      restrict: "A",
      link: function(scope, elem, attrs) {
        function showNoImage() {
          if(attrs.filePath === 'project') {
            elem.attr("src", 'img/no-image.png');
          } else {
            elem.attr("src", 'img/no-avatar.png');
          }
        }

        scope.$watch(function() {
          return attrs.src;
        }, function(n, o) {
          if(!angular.isDefined(n)) {
            showNoImage();
          } else {
            $timeout(function() {
              var avatarUrl = constant.nodeServer + '/' + attrs.src;
              if(/^\//.test(attrs.src)) {
                avatarUrl = constant.nodeServer + attrs.src;
              }
              var img = $document[0].createElement('img');
              img.onerror = function() {
                showNoImage();
              };
              img.src = avatarUrl;
              elem.attr('src', avatarUrl);
            });
          }
        });
      }
    };
  }
  ]);
  return module;
});
