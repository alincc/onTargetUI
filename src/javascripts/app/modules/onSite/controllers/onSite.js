define(function(require) {
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', '$q', 'documentFactory', '$modal', function($scope, $rootScope, $q, documentFactory, $modal) {

    $scope.isLoading = true;
    $scope.viewMode = "list";

    //list all document
    function getUploadedDocumentList(){

      documentFactory.getUploadedDocumentList($rootScope.currentProjectInfo.projectId).
          then(function(content){
            $scope.isLoading = false;
            $scope.uploadedDocumentList = content.data.uploadedDocumentList;
            console.log($scope.uploadedDocumentList);
          }, function(error){
            $scope.isLoading = false;
            $scope.uploadedDocumentList = [];
          });
    }

    getUploadedDocumentList();

    //preview document
    var previewModalInstance;
    $scope.preview = function(doc) {
      previewModalInstance = $modal.open({
        animation: true,
        templateUrl: 'onSite/templates/document.preview.html',
        controller: 'DocumentPreviewController',
        windowClass: 'full-screen-doc-preview',
        size: 'lg',
        resolve: {
          doc: function() {
            return doc;
          }
        }
      });
    };

    //change view mode
    $scope.changeMode = function(mode){
      $scope.viewMode = mode;
    };

  }];
  return controller;
});
