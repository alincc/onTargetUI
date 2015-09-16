define(function(require) {
  'use strict';
  var angular = require('angular'),
    compareTo = require('./username'),
    newLines = require('./newLines'),
    fileicon = require('./fileicon'),
    cut = require('./cut'),
    task = require('./task'),
    filePath = require('./filePath'),
    fileName = require('./fileName'),
    number = require('./number'),
    fileThumbnail = require('./fileThumbnail');

  var module = angular.module('common.filters',
    [
      'common.filters.username',
      'common.filters.fileicon',
      'common.filters.newLines',
      'common.filters.cut',
      'common.filters.task',
      'common.filters.filePath',
      'common.filters.fileName',
      'common.filters.number',
      'common.filters.fileThumbnail'
    ]);
  return module;
});