define(function() {
  'use strict';
  var controller = ['$scope', '$rootScope', 'categories', 'uploadFactory', '$timeout', 'documentFactory', '$modalInstance',
    function($scope, $rootScope, categories, uploadFactory, $timeout, documentFactory, $modalInstance) {
      $scope.uploadModel = {
        category: null,
        description: '',
        file: null,
        filePath: '',
        fileName: '',
        fileType: ''
      };
      $scope.isUploading = false;
      $scope.percentage = 0;

      $scope.categories = categories;

      $scope.$watch('uploadModel.file', function(file) {
        console.log(file); // !file.$error
        if(!$scope.isUploading && file) {
          $scope.uploadModel.filePath = '';
          $scope.uploadModel.fileName = '';
          $scope.uploadModel.fileType = '';
          $scope.upload($scope.uploadModel.file);
        }
      });

      $scope.upload = function(file) {
        $scope.isUploading = true;
        uploadFactory.upload(file, 'onsite').progress(function(evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          $scope.percentage = progressPercentage;
        }).success(function(data, status, headers, config) {
          $timeout(function() {
            //$scope.log = 'file: ' + config.file.name + ', Response: ' + JSON.stringify(data) + '\n' + $scope.log;
            $scope.uploadModel.filePath = 'assets/onsite/' + data.imageName;
            $scope.uploadModel.fileName = data.imageName;
            $scope.uploadModel.fileType = file.type;
            $scope.isUploading = false;
          });
        })
          .error(function() {
            $scope.isUploading = false;
          });
      };

      $scope.removeFile = function() {
        $scope.uploadModel.filePath = '';
        $scope.uploadModel.fileName = '';
        $scope.uploadModel.fileType = '';
        $scope.isUploading = false;
        $scope.percentage = 0;
        //$scope.step1.$pristine();
      };

      $scope.saveDocumentInfo = function(model) {
        var data = {
          "projectId": $rootScope.currentProjectInfo.projectId,
          "name": model.fileName,
          "fileType": model.fileType,
          "createdBy": $rootScope.currentUserInfo.userId,
          "modifiedBy": $rootScope.currentUserInfo.userId,
          "categoryId": model.category.id,
          "description": model.description
        };
        documentFactory.saveUploadedDocsInfo(data)
          .success(function(resp) {
            $modalInstance.close(data);
          });
      };

      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };
    }];
  return controller;
});