define(function(require) {
  'use strict';
  var angular = require('angular');
  var module = angular.module('common.directives.app', []);
  module.directive("uiNav", ["$timeout",
    function() {
      return {
        restrict: "AC",
        link: function(scope, elem) {
          elem.find("a").bind("click", function() {
            var a = angular.element(this).parent(),
              b = a.parent()[0].querySelectorAll(".active");
            a.toggleClass("active");
            angular.element(b).removeClass("active");
          });
        }
      };
    }
  ]);
  module.directive("toggle", ["$timeout",
    function() {
      return {
        restrict: "AC",
        link: function(scope, elem, attrs) {
          var $elem;

          function getParents(el, c) {
            if(angular.isDefined(el) && angular.isDefined(el.parent()) && el.parent() !== null) {
              if(el.hasClass(c)) {
                $elem = el;
                return el;
              } else {
                getParents(el.parent(), c);
              }
            } else {
              return null;
            }
          }

          if(attrs.toggle === 'dropdown' && !angular.isDefined(attrs.target)) {
            getParents(elem, 'dropdown');
          }

          elem.on('click', function() {
            if($elem) {
              $elem.toggleClass('open');
            }
            else if(attrs.target) {
              var $target = angular.element(document.querySelector(attrs.target));
              if($target) {
                if(attrs.toggle === 'modal') {
                  $target.toggleClass('in');
                  if($target.hasClass('in')) {
                    $target.css('display', 'block');
                  }
                  else {
                    $target.css('display', '');
                  }
                }
              }
            }
          });

          scope.$on('$destroy', function() {
            elem.on('click');
          });
        }
      };
    }
  ]);
  module.directive("dismiss", ["$timeout",
    function() {
      return {
        restrict: "AC",
        link: function(scope, elem, attrs) {
          var $modal;

          function getParents(el) {
            if(angular.isDefined(el) && angular.isDefined(el.parent()) && el.parent() !== null) {
              if(el.hasClass('modal')) {
                $modal = el;
                return el;
              } else {
                getParents(el.parent());
              }
            } else {
              return null;
            }
          }

          getParents(elem);

          elem.on('click', function() {
            if($modal) {
              if(attrs.dismiss === 'modal') {
                $modal.css('display', '');
                $modal.removeClass('in');
              }
            }
          });

          scope.$on('$destroy', function() {
            elem.on('click');
          });
        }
      };
    }
  ]);
  module.directive('background', ['$location', function($location) {
    return {
      restrict: 'A',
      link: function(scope, elem, attrs) {
        scope.$watch(function() {
          return $location.path();
        }, function(e) {
          switch(e) {
            case '/signin':
            case '/forgot-password':
            case '/request-demo':
            case '/demo-signup':
            case '/pages/signup':
            case '/pages/reset-password':
              elem.addClass('has-background');
              break;
            default:
              elem.removeClass('has-background');
              break;
          }
        });
      }
    };
  }]);
  return module;
});