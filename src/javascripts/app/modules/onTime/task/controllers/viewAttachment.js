define(function(require) {
  'use strict';
  var angular = require('angular'),
    lodash = require('lodash');

  var controller = [
    '$scope',
    'attachment',
    '$modalInstance',
    '$sce',
    'utilFactory',
    '$filter',
    function($scope,
             attachment,
             $modalInstance,
             $sce,
             utilFactory,
             $filter) {
      $scope.attachment = attachment;
      $scope.fileExtension = utilFactory.getFileExtension(attachment.fileName);
      $scope.filePath = $filter('filePath')(attachment.fileName);
      $scope.isPdf = /(pdf$)/.test($scope.filePath);
      $scope.isImage = /(png|jpg|jpeg|gif)/.test($scope.fileExtension);
      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };

      $scope.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
      };
    }];
  return controller;
});