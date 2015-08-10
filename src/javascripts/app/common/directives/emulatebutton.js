

define(function (require) {
    'use strict';

    var angular = require('angular'),
        module;

    module = angular.module('common.directives.emulatebutton', [])
        .directive('emulateButton', function () {
            return function (scope, element) {
              scope.timeout = null; // disable active on drag
              element.bind("touchstart touchend mousedown mouseup mouseleave move drag", function(e){
                if (e.type === "touchstart" ||
                  e.type === "mousedown" ||
                  // e.type === "tap" ||
                  e.type === "touch"){
                  if (scope.timeout){
                    clearTimeout(scope.timeout);
                  }
                  scope.timeout = setTimeout(function(){
                    element.toggleClass( "active", true);
                  },10);
                } else if (e.type === "drag") {
                  if (scope.timeout){
                    clearTimeout(scope.timeout);
                  }
                  element.toggleClass( "active", false);
                } else {
                  if (scope.timeout){
                    clearTimeout(scope.timeout);
                  }
                  setTimeout(function(){
                    element.toggleClass( "active", false);
                  }, 100);
                }
              });

              scope.$on('$destroy', function() {
                element.unbind('touchstart touchend mousedown mouseup mouseleave move drag');
              });
            };
        });

    return module;

});
