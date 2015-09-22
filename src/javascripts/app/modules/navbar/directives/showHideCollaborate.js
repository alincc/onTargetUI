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
            case '/app/create-project':
            case '/app/edit-project':
            case '/app/projectlist':
            case '/app/editprofile':
            case '/app/changePassword':
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