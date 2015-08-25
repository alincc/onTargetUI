define(function(require) {
  'use strict';
  var angular = require('angular'),
    utilServiceModule = require('app/common/services/util'),
    angularSanitize = require('angularSanitize');
  var module = angular.module('common.filters.fileicon', ['common.services.util', 'ngSanitize'])
    .filter('fileicon', ['utilFactory', '$sce', function(utilFactory, $sce) {
      return function(value) {
        if(value) {
          var fileExtension = utilFactory.getFileExtension(value);
          var icon = 'file';
          if(/(pdf)/.test(fileExtension)) {
            icon = 'pdf';
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
          }
          else if(/(png)/.test(fileExtension)) {
            icon = 'png';
          }
          else if(/(gif)/.test(fileExtension)) {
            icon = 'gif';
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

