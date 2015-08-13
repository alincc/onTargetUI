define(function (require){
  'use strict';
  var angular = require('angular');
  var directive = ['$location', function ($location){
    return {
      restrict: 'A',
      link: function (scope, elem, attrs){
        scope.$watch(function (){
          return $location.path();
        }, function (e){
          switch (e) {
            case '/app/projectlist':
              elem.hide();
              break;
            default:
              elem.show();
              break;
          }
        });
      }
    };
  }];
  return directive;
});