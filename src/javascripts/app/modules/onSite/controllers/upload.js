define(function(require) {
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', 'categories', 'fileFactory', '$timeout', 'documentFactory', '$modalInstance', 'googleDriveFactory', 'boxFactory', 'dropBoxFactory',
    function($scope, $rootScope, categories, fileFactory, $timeout, documentFactory, $modalInstance, googleDriveFactory, boxFactory, dropBoxFactory) {
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
        isLeeching: false,
        googleDrive: {
          isAuth: googleDriveFactory.isAuth(),
          isLoading: false,
          isValidating: false,
          isHaveMore: false,
          isLeeching: false,
          connect: function() {
            googleDriveFactory.authorize()
              .then(function() {
                $scope.extenalStorage.googleDrive.isAuth = true;
                $scope.loadGoogleFile();
              });
          }
        },
        box: {
          page: 0,
          isHaveMore: false,
          isAuth: boxFactory.isAuth(),
          isLoading: false,
          isLeeching: false,
          connect: function() {
            boxFactory.authorize()
              .then(function() {
                $scope.loadBoxFile();
              });
          }
        },
        dropBox: {
          isAuth: dropBoxFactory.isAuth(),
          isLoading: false,
          isLeeching: false,
          connect: function() {
            dropBoxFactory.authorize()
              .then(function() {
                $scope.loadDropBoxFile();
              });
          }
        }
      };

      // Google Drive
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
            $scope.extenalStorage.googleDrive.isHaveMore = files.length !== 0;
            if(files.length > 0) {
              $scope.uploadModel.fileList = $scope.uploadModel.fileList.concat($scope.progressGoogleDriveFile(files));
            }
            $scope.extenalStorage.googleDrive.isLoading = false;
            $scope.$broadcast('content.reload');
          }, function() {
            $scope.extenalStorage.googleDrive.isLoading = false;
          });
      };

      // Box.com
      $scope.progressBoxFile = function(list) {
        return _.map(_.filter(list, function(el) {
          return el.type !== 'folder';
        }), function(el) {
          var fileModel = {};
          //fileModel.mimeType = el.mimeType;
          fileModel.name = el.name;

          // File name
          fileModel.fileName = fileModel.name.substring(fileModel.name.lastIndexOf('/') + 1);

          // File extension
          fileModel.ext = fileModel.name.substring(fileModel.name.lastIndexOf('.') + 1);

          // File url
          fileModel.downloadUrl = 'https://api.box.com/2.0/files/' + el.id + '/content';

          return fileModel;
        });
      };

      $scope.loadBoxFile = function(loadMore) {
        if(loadMore) {
          $scope.extenalStorage.box.page = $scope.extenalStorage.box.page + 1;
        }
        else {
          $scope.extenalStorage.box.page = 0;
        }
        $scope.extenalStorage.box.isLoading = true;
        boxFactory.loadData(0, $scope.extenalStorage.box.page * 10, 10)
          .then(function(resp) {
            $scope.extenalStorage.box.isHaveMore = resp.total_count > (($scope.extenalStorage.box.page + 1) * 10);
            $scope.uploadModel.fileList = $scope.uploadModel.fileList.concat($scope.progressBoxFile(resp.entries));
            $scope.extenalStorage.box.isLoading = false;
            $scope.$broadcast('content.reload');
          }, function() {
            $scope.extenalStorage.box.isLoading = false;
          });
      };

      // DropBox.com
      $scope.progressDropBoxFile = function(list) {
        return _.map(_.filter(list, function(el) {
          return el.icon !== 'folder';
        }), function(el) {
          var fileModel = {};
          //fileModel.mimeType = el.mimeType;
          fileModel.name = el.path.substring(el.path.lastIndexOf('/') + 1);

          // File name
          fileModel.fileName = fileModel.name;

          // File extension
          fileModel.ext = fileModel.name.substring(fileModel.name.lastIndexOf('.') + 1);

          // File url
          fileModel.downloadUrl = 'https://content.dropboxapi.com/1/files/auto' + el.path;

          return fileModel;
        });
      };

      $scope.loadDropBoxFile = function(dir) {
        $scope.extenalStorage.dropBox.isLoading = true;
        dropBoxFactory.loadData('', 100)
          .then(function(resp) {
            console.log(resp);
            $scope.uploadModel.fileList = $scope.uploadModel.fileList.concat($scope.progressDropBoxFile(resp.contents));
            $scope.extenalStorage.dropBox.isLoading = false;
            $scope.$broadcast('content.reload');
          }, function() {
            $scope.extenalStorage.dropBox.isLoading = false;
          });
      };

      // Common fn
      $scope.leechFile = function(file, source) {
        $scope.extenalStorage.isLeeching = true;

        function done(resp) {
          if(resp) {
            $scope.uploadModel.filePath = resp.url;
            $scope.uploadModel.fileName = resp.name;
            $scope.uploadModel.fileType = resp.type;
          }
          $scope.extenalStorage.isLeeching = false;
        }

        if(source === 'GoogleDrive') {
          $scope.extenalStorage.googleDrive.isLeeching = true;
          googleDriveFactory.downloadFile(file.downloadUrl, file.fileName)
            .success(function(resp) {
              $scope.extenalStorage.googleDrive.isLeeching = false;
              done(resp);
            })
            .error(function(err) {
              $scope.extenalStorage.googleDrive.isLeeching = false;
              done();
            });
        }
        else if(source === 'Box') {
          $scope.extenalStorage.box.isLeeching = true;
          boxFactory.downloadFile(file.downloadUrl, file.fileName)
            .success(function(resp) {
              $scope.extenalStorage.box.isLeeching = false;
              done(resp);
            })
            .error(function(err) {
              $scope.extenalStorage.box.isLeeching = false;
              done();
            });
        }
        else if(source === 'DropBox') {
          $scope.extenalStorage.dropBox.isLeeching = true;
          boxFactory.downloadFile(file.downloadUrl, file.fileName)
            .success(function(resp) {
              $scope.extenalStorage.dropBox.isLeeching = false;
              done(resp);
            })
            .error(function(err) {
              $scope.extenalStorage.dropBox.isLeeching = false;
              done();
            });
        }
      };

      $scope.selectSource = function(s) {
        $scope.uploadModel.fileList = [];
        if(s === 'GoogleDrive') {
          $scope.extenalStorage.googleDrive.isValidating = true;
          $scope.extenalStorage.googleDrive.isLoading = true;
          googleDriveFactory.validateToken()
            .then(function() {
              $scope.extenalStorage.googleDrive.isAuth = true;
              $scope.extenalStorage.googleDrive.isValidating = false;
              $scope.loadGoogleFile();
            }, function() {
              $scope.extenalStorage.googleDrive.isAuth = false;
              $scope.extenalStorage.googleDrive.isValidating = false;
              $scope.extenalStorage.googleDrive.isLoading = false;
            });
          $scope.uploadModel.source = s;
        }
        else if(s === 'Box') {
          if($scope.extenalStorage.box.isAuth) {
            $scope.loadBoxFile();
          }
          $scope.uploadModel.source = s;
        }
        else if(s === 'DropBox') {
          if($scope.extenalStorage.dropBox.isAuth) {
            $scope.loadDropBoxFile();
          }
          $scope.uploadModel.source = s;
        }
        else {
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
        fileFactory.upload(file, null, 'temp').progress(function(evt) {
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
        fileFactory.move($scope.uploadModel.filePath, null, 'projects', $rootScope.currentProjectInfo.projectId, 'onsite')
          .success(function(resp){
            model.filePath = resp.url;
            model.fileName = resp.name;
            model.fileType = resp.type;
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
          });
      };

      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };
    }];
  return controller;
});