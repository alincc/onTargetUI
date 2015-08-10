define(function(require) {
  'use strict';
  var angular = require('angular'),
    emulateButton = require('./cardNumber'),
    autoFocus = require('./number'),
    compareTo = require('./compareTo');

  var module = angular.module('common.validators',
    [
      'common.validators.cardNumber',
      'common.validators.number',
      'common.validators.compareTo'
    ]);
  return module;
});