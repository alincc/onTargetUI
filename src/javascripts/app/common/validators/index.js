define(function(require) {
  'use strict';
  var angular = require('angular'),
    emulateButton = require('./cardNumber'),
    autoFocus = require('./number'),
    compareTo = require('./compareTo'),
    requireMultiple = require('./requireMultiple'),
    dateRange = require('./dateRange'),
    ngMoney = require('./money');

  var module = angular.module('common.validators',
    [
      'common.validators.cardNumber',
      'common.validators.number',
      'common.validators.compareTo',
      'common.validators.requireMultiple',
      'common.validators.dateRange',
      'common.validators.money'
    ]);
  return module;
});