define(function(require) {
  'use strict';
  var angular = require('angular'),
    utilServiceModule = require('app/common/services/util'),
    angularSanitize = require('angularSanitize'),
    config = require('app/config');
  var module = angular.module('common.filters.fileThumbnail', ['common.services.util', 'ngSanitize', 'app.config'])
    .filter('fileThumbnail', ['utilFactory', '$sce', 'appConstant', function(utilFactory, $sce, constant) {
      return function(value) {
        if(value) {
          var fileExtension = utilFactory.getFileExtension(value);
          var icon = 'file';
          if(/(pdf)/.test(fileExtension)) {
            icon = 'pdf';
            var fileName = value.substring(value.lastIndexOf('/') + 1).substring(0, value.substring(value.lastIndexOf('/') + 1).lastIndexOf('.'));
            var dirname = value.match(/(.*)[\/\\]/)[1]||'';
            var thumbnail = constant.nodeServer + '/' + dirname + '/converted_' + fileName + '.jpg';
            return thumbnail;
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
          else if(/(jpg|jpeg)/.test(fileExtension)) {
            icon = 'jpeg';
            return constant.nodeServer + '/' + value;
          }
          else if(/(png)/.test(fileExtension)) {
            icon = 'png';
            return constant.nodeServer + '/' + value;
          }
          else if(/(gif)/.test(fileExtension)) {
            icon = 'gif';
            return constant.nodeServer + '/' + value;
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

