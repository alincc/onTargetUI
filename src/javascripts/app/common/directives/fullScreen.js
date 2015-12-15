define(function(require) {
  'use strict';
  var angular = require('angular'),
    module;
  module = angular.module('common.directives.fullScreen', []);
  module.directive('fullScreen', [
    function() {
    return {
      restrict: 'A',
      link: function(scope, elem, attrs) {
        elem.on('click', function(){
          var element = document.querySelector(attrs.fullScreen);
          var isKeyboardAvailbleOnFullScreen = (typeof Element !== 'undefined' && 'ALLOW_KEYBOARD_INPUT' in Element) && Element.ALLOW_KEYBOARD_INPUT;
          if(element){
            if(element.requestFullScreen) {
              element.requestFullScreen();
            } else if(element.mozRequestFullScreen) {
              element.mozRequestFullScreen();
            } else if(element.webkitRequestFullscreen) {
              // Safari temporary fix
              if (/Version\/[\d]{1,2}(\.[\d]{1,2}){1}(\.(\d){1,2}){0,1} Safari/.test(navigator.userAgent)) {
                element.webkitRequestFullscreen();
              } else {
                element.webkitRequestFullscreen(isKeyboardAvailbleOnFullScreen);
              }
            } else if (element.msRequestFullscreen) {
              element.msRequestFullscreen();
            }
          }
        });

        scope.$on('$destroy', function(){
          elem.off('click');
        });
      }
    };
  }]);
  return module;
});