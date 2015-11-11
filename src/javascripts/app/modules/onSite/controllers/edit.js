define(function (require) {
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', 'document', 'categories', 'projectId', 'documentFactory', '$modalInstance', 'fileFactory', '$filter',
    function ($scope, $rootScope, document, categories, projectId, documentFactory, $modalInstance, fileFactory, $filter) {
      $scope.document = document;
      $scope.documentName = $filter('fileName')($scope.document.name);
      $scope.categories = categories;

      $scope.saveDocumentInfo = function (document) {
        var data = {
          "projectId": projectId,
          "name": $scope.documentName,
          "fileType": document.fileType,
          "createdBy": document.createdBy,
          "modifiedBy": $rootScope.currentUserInfo.userId,
          "categoryId": document.projectFileCategoryId.id,
          "description": document.description,
          "projectFileId": document.fileId,
          "parentProjectFileId": document.parentProjectFileId,
          "isConversionComplete": false,
          "thumbnailImageName" : "/assets/projects/TBAeXqI4822DWZ4fQFcI/abcdef.thumb.jpg",
          "filePath": document.name
        };

        documentFactory.saveUploadedDocsInfo(data)
          .success(function (r) {
            $scope.$emit('updateSuccess');
            $modalInstance.close(data);
          })
          .error(function () {
            $scope.document_frm.$setPristine();
          });
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    }];
  return controller;
});