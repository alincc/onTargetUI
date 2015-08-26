define(function(require) {
  'use strict';
  var angular = require('angular'),
    uiRouter = require('uiRouter'),
    config = require('app/config'),
    template = require('text!./templates/onSite.html'),
    uploadTemplate = require('text!./templates/upload.html'),
    controller = require('./controllers/onSite'),
    uploadController = require('./controllers/upload'),
    projectContextModule = require('app/common/context/project'),
    documentServiceModule = require('app/common/services/document'),
    mentio = require('mentio'),
    angularUiSelect = require('angularUiSelect'),
    angularLocalStorage = require('angularLocalStorage'),
    uploadServiceModule = require('app/common/services/upload'),
    onSiteServiceModule = require('app/common/services/onSite'),
    utilServiceModule = require('app/common/services/util'),
    googleDriveServiceModule = require('app/common/services/googleDrive'),
    boxServiceModule = require('app/common/services/box'),
    angularSanitize = require('angularSanitize'),
    toaster = require('toaster');
  var module = angular.module('app.onSite', ['ui.router', 'mentio', 'app.config', 'common.context.project', 'common.services.document', 'angularLocalStorage', 'ui.select', 'common.services.upload', 'common.services.onSite', 'common.services.util', 'ngSanitize', 'common.services.googleDrive', 'common.services.box', 'toaster']);
  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('onSite/templates/onSite.html', template);
    $templateCache.put('onSite/templates/upload.html', uploadTemplate);
  }]);

  module.controller('OnSiteController', controller);
  module.controller('UploadDocumentController', uploadController);

  module.config(
    ['$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('app.onSite', {
            url: '/onSite?docId',
            templateUrl: 'onSite/templates/onSite.html',
            controller: 'OnSiteController',
            reloadOnSearch: false,
            resolve: {
              projectValid: ['$location', 'projectContext', '$q', '$state', '$window', function($location, projectContext, $q, $state, $window) {
                var deferred = $q.defer();
                if(projectContext.valid()) {
                  deferred.resolve();
                } else {
                  $window.location.href = $state.href('app.projectlist');
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
