define(function (require){
  'use strict';
  var angular = require('angular');
  var directive = [function (){
    return {
      restrict: 'A',
      templateUrl:'dashboard/templates/task.html'
    };
  }];
  return directive;
});