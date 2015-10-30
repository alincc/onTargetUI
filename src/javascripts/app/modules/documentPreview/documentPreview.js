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
            url: '/preview?onAction&docId',
            templateUrl: 'documentPreview/templates/documentPreview.html',
            controller: 'PreviewDocumentController',
            resolve: {
              document: ['$rootScope', '$location', '$q', '$state', '$stateParams', 'documentFactory', '$window', 'fileFactory',
                function($rootScope, $location, $q, $state, $stateParams, documentFactory, $window, fileFactory) {
                  var deferred = $q.defer();
                  switch($stateParams.onAction) {
                    case 'onSite' :
                      if($stateParams.docId) {
                        documentFactory.getDocumentDetail({
                          projectId: $rootScope.currentProjectInfo.projectId,
                          projectFileId: Number($stateParams.docId)
                        }).success(
                          function(resp) {
                            if(/(pdf$)/.test(resp.projectFile.name)) {
                              fileFactory.getPdfImage(resp.projectFile.name)
                                .then(function (r){
                                  deferred.resolve({
                                    projectFile: resp.projectFile,
                                    imagePath: r.data.url
                                  });
                                }, function (err, status){
                                  console.log(err, status);
                                });
                            } else {
                              deferred.resolve({projectFile: resp.projectFile});
                            }
                          }
                        );
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
                          imagePath: doc.location
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
