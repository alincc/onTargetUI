define(function (require){
  'use strict';
  var angular = require('angular'),
    utilServiceModule = require('app/common/services/util'),
    angularSanitize = require('angularSanitize');
  var module = angular.module('common.filters.fileicon', ['common.services.util', 'ngSanitize'])
    .filter('fileicon', ['utilFactory', '$sce', function (utilFactory, $sce){
      return function (value){
        if (value) {
          var fileExtension = utilFactory.getFileExtension(value.name);
          var icon = 'fa-file-o';
          if (/(pdf)/.test(fileExtension)) {
            icon = 'fa-pdf-o';
          }
          else if (/(txt)/.test(fileExtension)) {
            icon = 'fa-file-text-o';
          }
          else if (/(doc|docx)/.test(fileExtension)) {
            icon = 'fa-file-word-o';
          }
          else if (/(xls|xlsx)/.test(fileExtension)) {
            icon = 'fa-file-excel-o';
          }
          else if (/(ppt|pptx)/.test(fileExtension)) {
            icon = 'fa-file-powerpoint-o';
          }
          else if (/(zip|rar|7zip)/.test(fileExtension)) {
            icon = 'fa-file-zip-o';
          }
          else if (/(jpg|jpeg|png|bmp)/.test(fileExtension)) {
            icon = 'fa-file-image-o';
          }
          else if (/(mp3|wav)/.test(fileExtension)) {
            icon = 'fa-file-audio-o';
          }
          else if (/(mp4|wmv)/.test(fileExtension)) {
            icon = 'fa-file-video-o';
          }
          return '<i class="fa ' + icon + '"></i>';
        }
        else {
          return '';
        }
      };
    }]);
  return module;
});

