define(function(require) {
  'use strict';
  var angular = require('angular'),
    uiRouter = require('uiRouter'),
    config = require('app/config'),
    previewTemplate = require('text!./templates/documentPreview.html'),
    previewController = require('./controllers/documentPreview'),
    projectContextModule = require('app/common/context/project'),
    documentServiceModule = require('app/common/services/document'),
    mentio = require('mentio'),
    angularUiSelect = require('angularUiSelect'),
    angularLocalStorage = require('angularLocalStorage'),
    fileServiceModule = require('app/common/services/file'),
    onSiteServiceModule = require('app/common/services/onSite'),
    utilServiceModule = require('app/common/services/util'),
    googleDriveServiceModule = require('app/common/services/googleDrive'),
    boxServiceModule = require('app/common/services/box'),
    dropBoxServiceModule = require('app/common/services/dropBox'),
    permissionServiceModule = require('app/common/services/permission'),
    angularSanitize = require('angularSanitize'),
    toaster = require('toaster'),
    fileThumbnail = require('app/common/filters/fileThumbnail'),
    fileDownloadPath = require('app/common/filters/fileDownloadPath'),
    notificationServiceModule = require('app/common/services/notifications'),
    taskServiceModule = require('app/common/services/task'),
    pdfViewerDirectiveModule = require('app/common/directives/pdfViewer'),
    ngSanitize = require('angularSanitize');
  var module = angular.module('app.documentPreview', ['ui.router', 'mentio', 'app.config', 'common.context.project', 'common.services.document', 'angularLocalStorage', 'ui.select', 'common.services.file', 'common.services.onSite', 'common.services.util', 'ngSanitize', 'common.services.googleDrive', 'common.services.box', 'toaster', 'common.services.permission', 'common.services.dropBox', 'common.filters.fileThumbnail', 'common.services.notifications', 'common.filters.fileDownloadPath', 'common.services.task', 'common.directives.pdfViewer', 'ngSanitize']);
  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('documentPreview/templates/documentPreview.html', previewTemplate);
  }]);
  module.controller('PreviewDocumentController', previewController);

  module.config(
    ['$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('app.previewDocument', {
            url: '/preview?docId?categoryId',
            templateUrl: 'documentPreview/templates/documentPreview.html',
            controller: 'PreviewDocumentController',
            resolve: {
              document: [
                '$rootScope',
                '$location',
                '$q',
                '$state',
                '$stateParams',
                'documentFactory',
                '$window',
                'onSiteFactory',
                'toaster',
                'fileFactory',
                'utilFactory',
                '$filter',
                function($rootScope,
                         $location,
                         $q,
                         $state,
                         $stateParams,
                         documentFactory,
                         $window,
                         onSiteFactory,
                         toaster,
                         fileFactory,
                         utilFactory,
                         $filter) {
                  var deferred = $q.defer(), currentDocument = null, parentDocument = null, versions = [], pages = [], zooms = [], documentTags, isPdf, isImage;

                  function getDocumentInfo(cb) {
                    documentFactory.getDocumentDetail({
                      projectId: $rootScope.currentProjectInfo.projectId,
                      projectFileId: parseInt($stateParams.docId)
                    })
                      .success(function(cD) {
                        currentDocument = cD;
                        isPdf = /\.(pdf)$/.test(currentDocument.projectFile.filePath);
                        isImage = /\.(jpg|jpeg|png|gif)$/.test(currentDocument.projectFile.filePath);
                        // Original
                        if(currentDocument.projectFile.parentProjectFileId === 0) {
                          versions = currentDocument.projectFile.versionProjectFiles;
                          cb();
                        }
                        else {
                          // Version
                          documentFactory.getDocumentDetail({
                            projectId: $rootScope.currentProjectInfo.projectId,
                            projectFileId: currentDocument.projectFile.parentProjectFileId
                          })
                            .success(function(pD) {
                              parentDocument = pD;
                              versions = parentDocument.projectFile.versionProjectFiles;
                              cb();
                            })
                            .error(function(err) {
                              toaster.pop('error', 'Error', 'Get document details failed');
                              deferred.reject();
                            });
                        }
                      })
                      .error(function(err) {
                        console.log(err);
                        deferred.reject();
                        toaster.pop('error', 'Error', 'Get document details failed');
                      });
                  }

                  function convertPdfToImages(document) {
                    // Update document conversion status to false (not completed)
                    onSiteFactory.updateDocumentConversionStatus(document.projectFile.fileId, false)
                      .success(function() {
                        // Start conversion progress
                        fileFactory.convertPDFToImage(document.projectFile.filePath, document.projectFile.fileId)
                          .then(function() {
                            toaster.pop('info', 'Info', 'PDF file conversion is in progress. Please try again!');
                            console.log('This file is not converted yet');
                            deferred.reject();
                          }, function(err) {
                            toaster.pop('error', 'Error', 'Failed to start pdf to image conversion!');
                            deferred.reject();
                          });
                      })
                      .error(function(err) {
                        toaster.pop('error', 'Error', 'Failed to update document status!');
                        console.log("Update document status failed!", err);
                        deferred.reject();
                      });
                  }

                  function getPdfPageImages(filePath, cb) {
                    onSiteFactory.getPdfImagePages(filePath)
                      .success(function(p) {
                        if(p.pages.length === 0) {
                          toaster.pop('error', 'Error', 'Cannot found any images for this file!');
                          deferred.reject();
                        }
                        else {
                          pages = p.pages;
                          cb(p.pages);
                        }
                      })
                      .error(function(err) {
                        toaster.pop('error', 'Error', 'Get pdf images failed');
                        deferred.reject();
                      });
                  }

                  function getDocumentZoom(filePath, cb) {
                    // Get document zoom level
                    onSiteFactory.getDocumentZoomLevel(filePath)
                      .success(function(z) {
                        if(z.length > 0) {
                          zooms = z;
                          cb(z);
                        } else {
                          toaster.pop('info', 'Info', 'PDF file conversion is in progress. Please try again!');
                          console.log('Zooms not found');
                          deferred.reject();
                        }
                      })
                      .error(function() {
                        toaster.pop('info', 'Info', 'PDF file conversion is in progress. Please try again!');
                        console.log('Get zoom document failed');
                        deferred.reject();
                      });
                  }

                  function getDocumentTags(fileId, cb) {
                    // Get document tags
                    onSiteFactory.getDocumentTags(fileId)
                      .success(function(dt) {
                        documentTags = dt.tags;
                        cb(dt.tags);
                      })
                      .error(function(err) {
                        console.log(err);
                        toaster.pop('error', 'Error', 'Get document tags failed');
                        deferred.reject();
                      });
                  }

                  function generateData() {
                    var result = {};
                    result.pdfImagePages = _.map(pages, function(el, idx) {
                      return {
                        imagePath: el,
                        maxZoom: zooms[idx].zoomLevel
                      };
                    });
                    result.parentDocument = parentDocument;
                    result.currentDocument = currentDocument;
                    result.zooms = zooms;
                    result.documentTags = documentTags;
                    result.pages = pages;
                    result.versions = versions;
                    return result;
                  }

                  getDocumentInfo(function() {
                    if(parentDocument) {
                      onSiteFactory.checkFileStatus(parentDocument.projectFile.filePath)
                        .success(function(stt) {
                          if(stt.status === "UnProceeded") {
                            convertPdfToImages(parentDocument);
                          } else {
                            if(isPdf) {
                              // Original
                              if(!parentDocument) {
                                // Get pdf images
                                getPdfPageImages(currentDocument.projectFile.filePath, function() {
                                  // Get document zoom level
                                  getDocumentZoom(currentDocument.projectFile.filePath, function() {
                                    if(zooms[0].zoomLevel <= 0) {
                                      toaster.pop('info', 'Info', 'PDF file conversion is in progress. Please try again!');
                                      console.log('Zoom page 1 not ready');
                                      deferred.reject();
                                      return;
                                    }
                                    // Get document tags
                                    getDocumentTags(currentDocument.projectFile.fileId, function() {
                                      deferred.resolve(generateData());
                                    });
                                  });
                                });
                              }
                              else {
                                // Version
                                // Get pdf images
                                getPdfPageImages(parentDocument.projectFile.filePath, function() {
                                  // Get document zoom level
                                  getDocumentZoom(parentDocument.projectFile.filePath, function() {
                                    // Get document tags
                                    getDocumentTags(currentDocument.projectFile.fileId, function() {
                                      deferred.resolve(generateData());
                                    });
                                  });
                                });
                              }
                            }
                            else {
                              pages = [];
                              // Get versions
                              if(parentDocument) {
                                // Get document zoom level
                                getDocumentZoom(parentDocument.projectFile.filePath, function() {
                                  // Get document tags
                                  getDocumentTags(currentDocument.projectFile.fileId, function() {
                                    deferred.resolve(generateData());
                                  });
                                });
                              }
                              else {
                                // Get document zoom level
                                getDocumentZoom(currentDocument.projectFile.filePath, function() {
                                  // Get document tags
                                  getDocumentTags(currentDocument.projectFile.fileId, function() {
                                    deferred.resolve(generateData());
                                  });
                                });
                              }
                            }
                          }
                        });
                    } else {
                      onSiteFactory.checkFileStatus(currentDocument.projectFile.filePath)
                        .success(function(stt) {
                          if(stt.status === "UnProceeded") {
                            convertPdfToImages(currentDocument);
                          } else {
                            if(isPdf) {
                              // Original
                              if(!parentDocument) {
                                // Get pdf images
                                getPdfPageImages(currentDocument.projectFile.filePath, function() {
                                  // Get document zoom level
                                  getDocumentZoom(currentDocument.projectFile.filePath, function() {
                                    if(zooms[0].zoomLevel <= 0) {
                                      toaster.pop('info', 'Info', 'PDF file conversion is in progress. Please try again!');
                                      console.log('Zoom page 1 not ready');
                                      deferred.reject();
                                      return;
                                    }
                                    // Get document tags
                                    getDocumentTags(currentDocument.projectFile.fileId, function() {
                                      deferred.resolve(generateData());
                                    });
                                  });
                                });
                              }
                              else {
                                // Version
                                // Get pdf images
                                getPdfPageImages(parentDocument.projectFile.filePath, function() {
                                  // Get document zoom level
                                  getDocumentZoom(parentDocument.projectFile.filePath, function() {
                                    // Get document tags
                                    getDocumentTags(currentDocument.projectFile.fileId, function() {
                                      deferred.resolve(generateData());
                                    });
                                  });
                                });
                              }
                            }
                            else {
                              pages = [];
                              // Get versions
                              if(parentDocument) {
                                // Get document zoom level
                                getDocumentZoom(parentDocument.projectFile.filePath, function() {
                                  // Get document tags
                                  getDocumentTags(currentDocument.projectFile.fileId, function() {
                                    deferred.resolve(generateData());
                                  });
                                });
                              }
                              else {
                                // Get document zoom level
                                getDocumentZoom(currentDocument.projectFile.filePath, function() {
                                  // Get document tags
                                  getDocumentTags(currentDocument.projectFile.fileId, function() {
                                    deferred.resolve(generateData());
                                  });
                                });
                              }
                            }
                          }
                        });
                    }
                  });

                  return deferred.promise;
                }]
            }
          });
      }
    ]
  );

  return module;
});
