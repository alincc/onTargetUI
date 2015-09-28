define(function(require) {
  'use strict';
  var angular = require('angular'),
    uiRouter = require('uiRouter'),
    config = require('app/config'),
    template = require('text!./templates/onSite.html'),
    uploadTemplate = require('text!./templates/upload.html'),
    deleteTemplate = require('text!./templates/delete.html'),
    previewTemplate = require('text!./templates/preview.html'),
    controller = require('./controllers/onSite'),
    uploadController = require('./controllers/upload'),
    deleteController = require('./controllers/delete'),
    previewController = require('./controllers/preview'),
    projectContextModule = require('app/common/context/project'),
    documentServiceModule = require('app/common/services/document'),
    mentio = require('mentio'),
    angularUiSelect = require('angularUiSelect'),
    angularLocalStorage = require('angularLocalStorage'),
    uploadServiceModule = require('app/common/services/file'),
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
    taskServiceModule = require('app/common/services/task');
  var module = angular.module('app.onSite', ['ui.router', 'mentio', 'app.config', 'common.context.project', 'common.services.document', 'angularLocalStorage', 'ui.select', 'common.services.file', 'common.services.onSite', 'common.services.util', 'ngSanitize', 'common.services.googleDrive', 'common.services.box', 'toaster', 'common.services.permission', 'common.services.dropBox', 'common.filters.fileThumbnail', 'common.services.notifications', 'common.filters.fileDownloadPath', 'common.services.task']);
  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('onSite/templates/onSite.html', template);
    $templateCache.put('onSite/templates/upload.html', uploadTemplate);
    $templateCache.put('onSite/templates/delete.html', deleteTemplate);
    $templateCache.put('onSite/templates/preview.html', previewTemplate);
  }]);

  module.controller('OnSiteController', controller);
  module.controller('UploadDocumentController', uploadController);
  module.controller('DeleteDocumentController', deleteController);
  module.controller('PreviewDocumentController', previewController);

  module.config(
    ['$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('app.onSite', {
            url: '/onSite',
            templateUrl: 'onSite/templates/onSite.html',
            controller: 'OnSiteController',
            //reloadOnSearch: false,
            resolve: {
              projectValid: ['$location', 'projectContext', '$q', '$state', '$window', 'permissionFactory', function($location, projectContext, $q, $state, $window, permissionFactory) {
                var deferred = $q.defer();
                if(projectContext.valid() && permissionFactory.checkMenuPermission('ONSITE')) {
                  deferred.resolve();
                } else {
                  $window.location.href = $state.href('app.projectlist');
                }
                return deferred.promise;
              }]
            }
          })
          .state('app.previewDocument', {
            url: '/:onAction/preview?docId',
            templateUrl: 'onSite/templates/preview.html',
            controller: 'PreviewDocumentController',
            resolve: {
              document: ['$rootScope', '$location', '$q', '$state', '$stateParams', 'documentFactory', '$window', 'taskFactory', function($rootScope, $location, $q, $state, $stateParams, documentFactory, $window, taskFactory) {
                var deferred = $q.defer();
                switch ($stateParams.onAction)
                {
                  case 'onSite' :
                    if($stateParams.docId) {
                      documentFactory.getDocumentDetail({
                        projectId: $rootScope.currentProjectInfo.projectId,
                        projectFileId: Number($stateParams.docId)
                      }).success(
                        function (resp){
                          deferred.resolve(resp.projectFile);
                        }
                      );
                    } else {
                      $window.location.href = $state.href('app.onSite');
                    }
                    break;
                  case 'onTime' :
                    if($rootScope.fileAttachment){
                      var doc = $rootScope.fileAttachment;
                      doc.name = doc.fileName;
                      deferred.resolve(doc);
                    }else {
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
