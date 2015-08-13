define(function (require){
  'use strict';
  var angular = require('angular'),
    config = require('app/config');
  var module = angular.module('common.directives.userAvatar', ['app.config']);
  module.directive('userAvatar', ['appConstant', '$timeout', '$document', function (constant, $timeout, $document){
    return {
      restrict: "A",
      link: function (scope, elem, attrs){
        attrs.$observe('src', function (){
          elem.attr('src', '');
          $timeout(function (){
            var avatarUrl = constant.resourceUrl + '/' + attrs.src;
            var img = $document[0].createElement('img');
            img.onerror = function (){
              elem.attr("src", 'img/no-avatar.png');
            };
            img.src = avatarUrl;
            elem.attr('src', avatarUrl);
          });
        });
      }
    };
  }
  ]);
  return module;
});
