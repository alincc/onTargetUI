define(function(require) {
  'use strict';
  var angular = require('angular');
  var module = angular.module('common.directives.userAvatar', []);
  module.directive('userAvatar', [function() {
    return {
      restrict: "A",
      scope: {
        user: '=userAvatar'
      },
      link: function(scope, elem, attrs) {
        function generateAvatar() {
          if (scope.user.avatar) {
            // display avatar
            console.log('print avatar');
          } else {
            // display name
            if (scope.user.firstName && scope.user.lastName) {
              elem.html((scope.user.firstName.substring(0, 1) + scope.user.lastName.substring(0, 1)).toUpperCase());
            } else if (scope.user.email) {
              // display email
              elem.html(scope.user.email.substring(0, 2).toUpperCase());
            }
          }
        }

        scope.$watch('user.id', function(n, o) {
          if (scope.user && n && n !== o) {
            generateAvatar();
          }
        });

        if (scope.user) {
          generateAvatar();
        }
      }
    };
  }
  ]);
  return module;
});
