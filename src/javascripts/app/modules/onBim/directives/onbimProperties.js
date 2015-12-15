define(function(require) {
  "use strict";

  var directive = [function() {
    return {
      restrict: 'A',
      templateUrl: 'onBim/templates/onbimProperties.html',
      scope: {
        minfo: '=',
        mobject: '='
      },
      controller: ['$scope', function($scope) {

      }],
      link: function() {
      }
    };
  }];
  return directive;
});