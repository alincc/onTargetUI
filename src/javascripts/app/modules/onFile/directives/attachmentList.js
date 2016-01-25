define(function (require) {
  'use strict';
  var angular = require('angular');
  var directive = [function () {
    return {
      restrict: 'A',
      scope: {
        attachments: '=',
        onEdit: '=',
        onApprove: '=',
        onView: '='
      },
      controller: [
        '$scope',
        '$window',
        '$filter',
        'appConstant',
        function ($scope,
                  $window,
                  $filter,
                  appConstant) {
          $scope.resourceUrl = appConstant.resourceUrl;

          $scope.downloadAttachment = function (file) {
            $window.open($filter('fileDownloadPathHash')(file.filePath));
          };
          $scope.removeFile = function (file, idx) {
            if (file.uploaded) {
              file.deleted = true;
            }
            else {
              $scope.attachments.splice(idx, 1);
            }
            $scope.$broadcast('uploadBox.DeleteFile', {idx: idx});
          };
        }],
      templateUrl: 'onFile/templates/attachmentList.html',
      link: function (scope, elem, attrs) {

      }
    };
  }];
  return directive;
});