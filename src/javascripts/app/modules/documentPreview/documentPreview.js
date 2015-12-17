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
    ngSanitize = require('angularSanitize'),
    activityServiceModule = require('app/common/services/activity'),
    linkTaskTpl = require('text!./templates/linkTask.html'),
    linkTaskDirective = require('./directives/linkTask');
  var module = angular.module('app.documentPreview', ['ui.router', 'mentio', 'app.config', 'common.context.project', 'common.services.document', 'angularLocalStorage', 'ui.select', 'common.services.file', 'common.services.onSite', 'common.services.util', 'ngSanitize', 'common.services.googleDrive', 'common.services.box', 'toaster', 'common.services.permission', 'common.services.dropBox', 'common.filters.fileThumbnail', 'common.services.notifications', 'common.filters.fileDownloadPath', 'common.services.task', 'common.directives.pdfViewer', 'ngSanitize', 'common.services.activity']);
  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('documentPreview/templates/documentPreview.html', previewTemplate);
    $templateCache.put('documentPreview/templates/linkTask.html', linkTaskTpl);
  }]);
  module.controller('PreviewDocumentController', previewController);
  module.directive('linkTask', linkTaskDirective);
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
                            toaster.pop('info', 'Info', (isPdf ? 'PDF file' : 'Image file') + ' conversion is in progress. Please try again!');
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

                  function getPages(document, cb) {
                    pages = _.map(_.sortBy(document.projectFile.projectFilePageDTOs, "imageName"), function(el, idx) {
                      return el.imagePath;
                    });
                    cb(pages);
                  }

                  function getDocumentZoom(document, cb) {
                    zooms = _.map(_.sortBy(document.projectFile.projectFilePageDTOs, "imageName"), function(el, idx) {
                      return {
                        page: idx + 1,
                        zoomLevel: el.zoomLevel
                      };
                    });
                    cb(zooms);
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
                    console.log(result);
                    return result;
                  }

                  getDocumentInfo(function() {
                    if(parentDocument) {
                      // Get pdf images
                      getPages(parentDocument, function() {
                        // Get document zoom level
                        getDocumentZoom(parentDocument, function() {
                          // Get document tags
                          getDocumentTags(currentDocument.projectFile.fileId, function() {
                            deferred.resolve(generateData());
                          });
                        });
                      });
                    } else {
                        // Get pdf images
                        getPages(currentDocument, function() {
                          // Get document zoom level
                          getDocumentZoom(currentDocument, function() {
                            if(zooms[0].zoomLevel <= 0) {
                              toaster.pop('info', 'Info', (isPdf ? 'PDF file' : 'Image file') + ' conversion is in progress. Please try again!');
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
