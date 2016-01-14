define(function(require) {
  'use strict';
  var angular = require('angular');
  var directive = [function() {
    return {
      restrict: 'A',
      scope: {
        attachments: '=pdfAttachmentList',
      },
      controller: ['$scope', '$window', '$filter', function($scope, $window, $filter) {
        $scope.downloadAttachment = function(file) {
          $window.open($filter('fileDownloadPathHash')(file.filePath));
        };
      }],
      templateUrl: 'onFile/templates/pdfAttachmentList.html',
      link: function(scope, elem, attrs) {

      }
    };
  }];
  return directive;
});