define(function(require) {
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', 'categories', 'uploadFactory', '$timeout', 'documentFactory', '$modalInstance', 'googleDriveFactory', 'utilFactory',
    function($scope, $rootScope, categories, uploadFactory, $timeout, documentFactory, $modalInstance, googleDriveFactory, utilFactory) {
      $scope.uploadModel = {
        category: null,
        description: '',
        file: null,
        filePath: '',
        fileName: '',
        fileType: '',
        source: 'Local',
        fileList: []
      };

      $scope.extenalStorage = {
        googleDrive: {
          isAuth: googleDriveFactory.isAuth(),
          isLoading: false,
          isLeeching: false,
          connect: function() {
            googleDriveFactory.authorize()
              .then(function() {
                $scope.extenalStorage.googleDrive.isAuth = true;
                $scope.loadGoogleFile();
              });
          }
        }
      };

      $scope.verifyAuthentication = function() {

      };

      $scope.progressGoogleDriveFile = function(list) {
        return _.map(_.filter(list, function(el) {
          return angular.isDefined(el.downloadUrl) || angular.isDefined(el.exportLinks);
        }), function(el) {
          var fileModel = {};
          fileModel.mimeType = el.mimeType;
          fileModel.name = el.title;
          if(angular.isDefined(el.downloadUrl)) {
            // File name
            fileModel.fileName = fileModel.name.substring(fileModel.name.lastIndexOf('/') + 1);

            // File extension
            if(el.fileExtension) {
              fileModel.ext = el.fileExtension;
            }
            else {
              fileModel.ext = fileModel.name.substring(fileModel.name.lastIndexOf('.') + 1);
            }
            fileModel.isMultiple = false;

            // File url
            fileModel.downloadUrl = el.downloadUrl;
          }
          else if(angular.isDefined(el.exportLinks)) {
            fileModel.isMultiple = true;
            fileModel.downloadUrls = [];
            for(var k in el.exportLinks) {
              if(el.exportLinks.hasOwnProperty(k)) {
                var obj = {
                  downloadUrl: el.exportLinks[k],
                  ext: el.exportLinks[k].substr(el.exportLinks[k].lastIndexOf('=') + 1),
                  name: fileModel.name,
                  fileName: fileModel.name.substring(fileModel.name.lastIndexOf('/') + 1) + '.' + el.exportLinks[k].substr(el.exportLinks[k].lastIndexOf('=') + 1)
                };
                fileModel.downloadUrls.push(obj);
              }
            }
          }

          return fileModel;
        });
      };

      $scope.loadGoogleFile = function(dir) {
        $scope.extenalStorage.googleDrive.isLoading = true;
        googleDriveFactory.loadFiles(dir)
          .then(function(files) {
            $scope.uploadModel.fileList = $scope.uploadModel.fileList.concat($scope.progressGoogleDriveFile(files));
            $scope.extenalStorage.googleDrive.isLoading = false;
            $scope.$broadcast('content.reload');
          }, function() {
            $scope.extenalStorage.googleDrive.isLoading = false;
          });
      };

      $scope.leechFile = function(file, source) {
        if(source === 'GoogleDrive') {
          $scope.extenalStorage.googleDrive.isLeeching = true;
          googleDriveFactory.downloadFile(file.downloadUrl, file.fileName)
            .success(function(resp) {
              $scope.uploadModel.filePath = resp.url;
              $scope.uploadModel.fileName = resp.name;
              $scope.uploadModel.fileType = resp.type;
              $scope.extenalStorage.googleDrive.isLeeching = false;
            })
            .error(function(err) {
              $scope.extenalStorage.googleDrive.isLeeching = false;
            });
        }
      };

      $scope.selectSource = function(s) {
        $scope.uploadModel.fileList = [];
        if(s === 'GoogleDrive') {
          googleDriveFactory.validateToken()
            .then(function() {
              $scope.extenalStorage.googleDrive.isAuth = true;
              $scope.loadGoogleFile();
              $scope.uploadModel.source = s;
            }, function() {
              $scope.uploadModel.source = s;
            });
        } else {
          $scope.uploadModel.source = s;
        }
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
        uploadFactory.upload(file).progress(function(evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          $scope.percentage = progressPercentage;
        }).success(function(data, status, headers, config) {
          $timeout(function() {
            //$scope.log = 'file: ' + config.file.name + ', Response: ' + JSON.stringify(data) + '\n' + $scope.log;
            $scope.uploadModel.filePath = data.url;
            $scope.uploadModel.fileName = data.name;
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
          "name": model.filePath,
          "fileType": model.fileType,
          "createdBy": $rootScope.currentUserInfo.userId,
          "modifiedBy": $rootScope.currentUserInfo.userId,
          "categoryId": model.category.id,
          "description": model.description
        };
        documentFactory.saveUploadedDocsInfo(data)
          .success(function(resp) {
            $modalInstance.close(data);
          })
          .error(function() {
            $scope.document_frm.$setPristine();
          });
      };

      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };

      $scope.verifyAuthentication();
    }];
  return controller;
});