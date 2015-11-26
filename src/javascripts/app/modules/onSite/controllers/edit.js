define(function(require) {
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', 'document', 'categories', 'projectId', 'documentFactory', '$modalInstance', 'fileFactory', '$filter',
    function($scope, $rootScope, document, categories, projectId, documentFactory, $modalInstance, fileFactory, $filter) {
      $scope.document = document;
      $scope.documentName = $filter('fileName')($scope.document.name);
      $scope.categories = categories;

      $scope.saveDocumentInfo = function(document) {
        console.log(document);
        var data = {
          "projectId": projectId,
          "name": $scope.documentName,
          "fileType": document.fileType,
          "createdBy": document.createdBy,
          "modifiedBy": $rootScope.currentUserInfo.userId,
          "categoryId": (document.projectFileCategoryId.projectFileCategoryId ? document.projectFileCategoryId.projectFileCategoryId : document.projectFileCategoryId.id).toString(),
          "description": document.description,
          "projectFileId": document.fileId,
          "parentProjectFileId": document.parentProjectFileId,
          "isConversionComplete": document.conversionComplete,
          "thumbnailImageName": document.thumbnailImageName,
          "filePath": document.filePath
        };

        documentFactory.saveUploadedDocsInfo(data)
          .success(function(r) {
            if(r.documentDetail){
              $modalInstance.close(r.documentDetail);
            }
          })
          .error(function() {
            $scope.document_frm.$setPristine();
          });
      };

      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };
    }];
  return controller;
});