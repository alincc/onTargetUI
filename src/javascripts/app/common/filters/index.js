define(function(require) {
  'use strict';
  var angular = require('angular'),
    compareTo = require('./username'),
    newLines = require('./newLines'),
    fileicon = require('./fileicon'),
    cut = require('./cut');

  var module = angular.module('common.filters',
    [
      'common.filters.username',
      'common.filters.fileicon',
      'common.filters.newLines',
      'common.filters.cut'
    ]);
  return module;
});