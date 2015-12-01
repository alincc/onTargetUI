define(function(require) {
  'use strict';
  var angular = require('angular'),
    utilServiceModule = require('app/common/services/util'),
    config = require('app/config');
  var module = angular.module('common.filters.fileThumbnail', ['common.services.util', 'app.config'])
    .filter('fileThumbnail', ['utilFactory', 'appConstant', function(utilFactory, constant) {
      return function(value) {
        if(value) {
          var fileExtension = utilFactory.getFileExtension(value);
          var fileName = value.substring(value.lastIndexOf('/') + 1);
          var fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
          var icon = 'file';
          if(/(pdf|jpg|jpeg|png|gif)/.test(fileExtension)) {
            return value.substring(0, value.lastIndexOf('/')) + '/' + fileName.replace(/\./g, '_') + '/' + fileNameWithoutExt + '.thumb.jpg';
          }
          else if(/(txt)/.test(fileExtension)) {
            icon = 'txt';
          }
          else if(/(doc|docx)/.test(fileExtension)) {
            icon = 'doc';
          }
          else if(/(xls|xlsx)/.test(fileExtension)) {
            icon = 'xls';
          }
          else if(/(tiff)/.test(fileExtension)) {
            icon = 'tiff';
          }
          return 'img/icons/file_type/' + icon + '.png';
        }
        else {
          return 'file.png';
        }
      };
    }]);
  return module;
});

