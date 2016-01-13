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
          return attrs.path;
        }, function(n, o) {
          if(!angular.isDefined(n)) {
            showNoImage();
          } else {
            $timeout(function() {
              if(!attrs.path.length) {
                showNoImage();
                return;
              }

              var avatarUrl = constant.resourceUrl + '/' + attrs.path;
              if(/^\//.test(attrs.path)) {
                avatarUrl = constant.resourceUrl + attrs.path;
              }

              if(/^http/.test(attrs.path)) {
                avatarUrl = attrs.path;
              }

              var img = $document[0].createElement('img');
              img.onerror = function() {
                showNoImage();
              };
              //img.onload = function() {
              //  elem.removeClass('no-avatar non-pixelate');
              //  var $this = this;
              //  elem.attr("src", $this.src);
              //};
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
