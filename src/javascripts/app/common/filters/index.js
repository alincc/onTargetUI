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
    escapeHtml = require('./escapeHtml'),
    fileThumbnail = require('./fileThumbnail'),
    fileDownloadPath = require('./fileDownloadPath'),
    fileDownloadPathHash = require('./fileDownloadPathHash'),
    documentNumber = require('./documentNumber'),
    datetimeUtc = require('./datetimeUtc');

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
      'common.filters.escapeHtml',
      'common.filters.fileThumbnail',
      'common.filters.fileDownloadPath',
      'common.filters.fileDownloadPathHash',
      'common.filters.documentNumber',
      'common.filters.datetimeUtc'
    ]);
  return module;
});