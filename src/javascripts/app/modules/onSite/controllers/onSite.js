define(function(require) {
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', '$q', 'documentFactory', '$modal', 'storage', function($scope, $rootScope, $q, documentFactory, $modal, storage) {

    $scope.isLoading = false;
    $scope.viewMode = "list";
    $scope.uploadedDocumentList = [];
    $scope.uploadedDocumentArrangedList = [];

    function arrangeData(data, itemPerRow) {
      var list = [];
      var row = [];
      _.forEach(data, function(dt, i) {
        if(i > 0 && i % itemPerRow === 0) {
          list.push(row);
          row = [];
        }
        row.push(dt);
        if(i === data.length - 1 && row.length > 0) {
          list.push(row);
        }
      });
      return list;
    }

    //list all document
    function getUploadedDocumentList() {
      $scope.isLoading = true;
      documentFactory.getUploadedDocumentList($rootScope.currentProjectInfo.projectId).
        then(function(content) {
          $scope.isLoading = false;
          $scope.uploadedDocumentList = content.data.uploadedDocumentList;
          $scope.uploadedDocumentArrangedList = arrangeData($scope.uploadedDocumentList, 4);
        }, function(error) {
          $scope.isLoading = false;
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
    $scope.changeMode = function(mode) {
      $scope.viewMode = mode;
    };

    // View mode
    var viewMode = storage.get('documentViewMode');
    if(!viewMode) {
      storage.set('documentViewMode', 'grid');
    }
    $scope.viewMode = viewMode || 'grid';
    $scope.changeMode = function(mode) {
      $scope.viewMode = mode;
      storage.set('documentViewMode', mode);
      $scope.uploadedDocumentArrangedList = arrangeData($scope.uploadedDocumentList, 4);
    };

  }];
  return controller;
});
