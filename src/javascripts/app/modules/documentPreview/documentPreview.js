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
            url: '/preview?onAction&docId?categoryId',
            templateUrl: 'documentPreview/templates/documentPreview.html',
            controller: 'PreviewDocumentController',
            resolve: {
              document: ['$rootScope', '$location', '$q', '$state', '$stateParams', 'documentFactory', '$window', 'onSiteFactory', 'toaster', '$timeout',
                function($rootScope, $location, $q, $state, $stateParams, documentFactory, $window, onSiteFactory, toaster, $timeout) {
                  var deferred = $q.defer();
                  switch($stateParams.onAction) {
                    case 'onSite' :
                      if($stateParams.docId) {
                        // Get document details
                        documentFactory.getDocumentDetail({
                          projectId: $rootScope.currentProjectInfo.projectId,
                          projectFileId: parseInt($stateParams.docId)
                        }).success(function(currentDocument) {
                          // Original
                          if(currentDocument.projectFile.parentProjectFileId === 0) {
                            deferred.resolve({
                              projectFile: currentDocument.projectFile,
                              versions: currentDocument.projectFile.versionProjectFiles
                            });
                          }
                          else {
                            // Version
                            documentFactory.getDocumentDetail({
                              projectId: $rootScope.currentProjectInfo.projectId,
                              projectFileId: currentDocument.projectFile.parentProjectFileId
                            })
                              .success(function(parentDocument) {
                                deferred.resolve({
                                  projectFile: currentDocument.projectFile,
                                  versions: parentDocument.projectFile.versionProjectFiles
                                });
                              })
                              .error(function(err) {
                                toaster.pop('error', 'Error', 'Get document details failed');
                              });
                          }

                        })
                          .error(function(err) {
                            console.log(err);
                            deferred.reject();
                            toaster.pop('error', 'Error', 'Get document details failed');
                          });
                      } else {
                        $window.location.href = $state.href('app.onSite');
                      }
                      break;
                    case 'onTime' :
                      if($rootScope.fileAttachment) {
                        var doc = $rootScope.fileAttachment;
                        doc.name = doc.fileName;
                        deferred.resolve({
                          projectFile: doc,
                          pages: [doc.location]
                        });
                      } else {
                        $window.location.href = $state.href('app.onTime');
                      }
                      break;
                  }

                  return deferred.promise;
                }]
            }
          });
      }
    ]
  );

  return module;
});
