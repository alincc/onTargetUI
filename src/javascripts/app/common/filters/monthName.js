define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config');
  var module = angular.module('common.filters.monthName', ['app.config'])
    .filter('monthName', ['appConstant', function(constant) {
      return function (monthNumber) { //1 = January
        var monthNames = [ 'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December' ];
        return monthNames[monthNumber - 1];
      };
    }]);
  return module;
});