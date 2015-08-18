define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config');
  var module = angular.module('common.directives.imagePath', ['app.config']);
  module.directive('imagePath', ['appConstant', '$timeout', '$document', function(constant, $timeout, $document) {
    return {
      restrict: "A",
      link: function(scope, elem, attrs) {
        function showNoImage() {
          if(attrs.imagePath === 'project') {
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
              var avatarUrl = constant.resourceUrl + '/' + attrs.src;
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
