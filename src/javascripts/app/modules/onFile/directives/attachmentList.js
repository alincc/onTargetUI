define(function(require) {
  'use strict';
  var angular = require('angular');
  var directive = [function() {
    return {
      restrict: 'A',
      scope: {
        attachments: '=',
        onEdit: '=',
        onApprove: '=',
        onView: '='
      },
      controller: ['$scope', '$window', '$filter', function($scope, $window, $filter) {
        $scope.downloadAttachment = function(file) {
          $window.open($filter('fileDownloadPathHash')(file.filePath));
        };
        $scope.removeFile = function(idx) {
          $scope.attachments.splice(idx, 1);
          $scope.$broadcast('uploadBox.DeleteFile', {idx: idx});
        };
      }],
      templateUrl: 'onFile/templates/attachmentList.html',
      link: function(scope, elem, attrs) {

      }
    };
  }];
  return directive;
});