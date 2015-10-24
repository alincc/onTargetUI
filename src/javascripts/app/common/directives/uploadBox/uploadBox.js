define(function(require) {
  'use strict';
  var angular = require('angular'),
    tpl = require('text!./templates/uploadBox.html'),
    lodash = require('lodash'),
    fileServiceModule = require('app/common/services/file'),
    googleDriveServiceModule = require('app/common/services/googleDrive'),
    boxServiceModule = require('app/common/services/box'),
    dropBoxServiceModule = require('app/common/services/dropBox'),
    module;
  module = angular.module('common.directives.uploadBox', ['common.services.file', 'common.services.googleDrive', 'common.services.box', 'common.services.dropBox']);

  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('uploadBox/templates/uploadBox.html', tpl);
  }]);

  module.directive('uploadBox', [function() {
    return {
      restrict: 'E',
      scope: {
        multiple: '@',
        files: '='
      },
      templateUrl: 'uploadBox/templates/uploadBox.html',
      controller: ['$scope', '$rootScope', 'fileFactory', '$timeout', 'googleDriveFactory', 'boxFactory', 'dropBoxFactory', '$q',
        function($scope, $rootScope, fileFactory, $timeout, googleDriveFactory, boxFactory, dropBoxFactory, $q) {
          $scope.multiple = $scope.multiple || false;
          $scope.uploadModel = {
            files: [],
            uploadedFiles: [],
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
                var fileObj = {
                  filePath: resp.url,
                  fileName: resp.name,
                  fileType: resp.type
                };

                if(!$scope.multiple) {
                  $scope.uploadModel.uploadedFiles = [fileObj];
                }
                else {
                  $scope.uploadModel.uploadedFiles.push(fileObj);
                }

                $scope.$emit('uploadBox.uploadCompleted', angular.copy($scope.uploadModel.uploadedFiles));
              }
              $scope.extenalStorage.isLeeching = false;
            }

            $scope.$emit('uploadBox.startUpload');
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
              dropBoxFactory.downloadFile(file.downloadUrl, file.fileName)
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

          $scope.$watch('uploadModel.files', function(files) {
            var promises = [];
            if(!$scope.isUploading && files) {
              $scope.isUploading = true;
              $scope.$emit('uploadBox.startUpload');
              if(angular.isArray(files)) {
                _.each(files, function(file) {
                  promises.push($scope.upload(file));
                });
              }
              else if(angular.isDefined(files)) {
                promises.push($scope.upload(files));
              }

              $q.all(promises)
                .then(function(values) {
                  if(!$scope.multiple) {
                    $scope.uploadModel.uploadedFiles = values;
                  }
                  else {
                    $scope.uploadModel.uploadedFiles = $scope.uploadModel.uploadedFiles.concat(values);
                  }

                  $scope.isUploading = false;

                  $scope.$emit('uploadBox.uploadCompleted', angular.copy($scope.uploadModel.uploadedFiles));
                }, function(errors) {
                  console.log(errors);
                });
            }
          });

          $scope.upload = function(file) {
            var deferred = $q.defer();
            fileFactory.upload(file, null, 'temp').progress(function(evt) {
              var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
              $scope.percentage = progressPercentage;
            })
              .success(function(data, status, headers, config) {
                //$scope.log = 'file: ' + config.file.name + ', Response: ' + JSON.stringify(data) + '\n' + $scope.log;
                deferred.resolve({
                  filePath: data.url,
                  fileName: data.name,
                  fileType: file.type
                });
              })
              .error(function(err) {
                deferred.reject(err);
              });

            return deferred.promise;
          };

          $scope.$on('uploadBox.DeleteFile', function(e, file) {
            console.log(file, $scope.uploadModel.uploadedFiles);
            $scope.uploadModel.uploadedFiles.splice(file.idx, 1);
            console.log(file, $scope.uploadModel.uploadedFiles);
          });
        }],
      link: function() {

      }
    };
  }]);
  return module;
});