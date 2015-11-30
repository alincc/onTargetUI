define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config');
  var module = angular.module('common.filters.pdfThumbnail', [])
    .filter('pdfThumbnail', [function() {
      return function(value) {
        var thumbnail = value;
        if(/\.pdf$/.test(value)) {
          var fileName = value.substring(value.lastIndexOf('/') + 1);
          var fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
          thumbnail = value.substring(0, value.lastIndexOf('/')) + '/' + fileName.replace(/\./, '_') + '/' + fileNameWithoutExt + '.thumb.jpg';
        }
        return thumbnail;
      };
    }]);
  return module;
});

