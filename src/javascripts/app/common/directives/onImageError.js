define(function (require) {
  'use strict';
  var angular = require('angular'),
    module = angular.module('common.directives.onImageError', []);

  module.directive('onImageError', [function () {
    return {
      restrict: 'A',
      scope: {
        onImageError: '@'
      },
      link: function (scope, element, attrs) {
        element.bind('error', function () {
          //var extension = attrs.src.split('.').pop();
          var extension = attrs.onImageError.split('.').pop();
          switch (extension) {
            case 'doc':
            case 'docx':
            {
              attrs.$set('src', "img/icons/file_type/doc.png");
              break;
            }
            case 'gif' :
            {
              attrs.$set('src', "img/icons/file_type/gif.png");
              break;
            }
            case 'jpg':
            case 'jpeg':
            {
              attrs.$set('src', "img/icons/file_type/jpeg.png");
              break;
            }
            case 'pdf':
            {
              attrs.$set('src', "img/icons/file_type/pdf.png");
              break;
            }
            case 'png':
            {
              attrs.$set('src', "img/icons/file_type/png.png");
              break;
            }
            case 'tiff':
            {
              attrs.$set('src', "img/icons/file_type/tiff.png");
              break;
            }
            case 'txt':
            {
              attrs.$set('src', "img/icons/file_type/txt.png");
              break;
            }
            case 'xls':
            case 'xlsx':
            {
              attrs.$set('src', "img/icons/file_type/xls.png");
              break;
            }
            default: {
              attrs.$set('src', "img/icons/file_type/file.png");
              break;
            }
          }
        });
      }
    };
  }]);

  return module;
});