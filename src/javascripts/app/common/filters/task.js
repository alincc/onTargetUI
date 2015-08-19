/**
 * Created by thophan on 8/19/2015.
 */
define(function (require){
  'use strict';
  var angular = require('angular');
  var module = angular.module('common.filters.task', [])
    .filter('taskSeverityByCode', function (){
      return function (input){
        var severity = {
          '1': 'CRITICAL',
          '2': 'HIGH',
          '3': 'LOW'
        };
        return severity[input];
      };
    });
});