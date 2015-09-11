define(function(require){
  'use strict';
  var angular = require('angular');
  var module = angular.module('common.filters.number', [])
    .filter('number', function(){
      return function(val){
        if(/^\(.*\)$/.test(val)) {
          val = val.replace('(', '-').replace(')', '');
        }
        return val;
      };
    });
  return module;
});

