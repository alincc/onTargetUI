define(function(require) {
  'use strict';
  var angular = require('angular'),
    uiRouter = require('uiRouter'),
    config = require('app/config'),
    template = require('text!./templates/onSite.html'),
    previewTemplate = require('text!./templates/document.preview.html'),
    controller = require('./controllers/onSite'),
    previewController = require('./controllers/document.preview'),
    projectContextModule = require('app/common/context/project'),
    documentServiceModule = require('app/common/services/document'),
    mentio = require('mentio'),
    angularLocalStorage = require('angularLocalStorage');
  var module = angular.module('app.onSite', ['ui.router', 'mentio', 'app.config', 'common.context.project', 'common.services.document', 'angularLocalStorage']);

  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('onSite/templates/onSite.html', template);
    $templateCache.put('onSite/templates/document.preview.html', previewTemplate);
  }]);

  module.controller('OnSiteController', controller);
  module.controller('DocumentPreviewController', previewController);

  module.config(
    ['$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('app.onSite', {
            url: '/onSite',
            templateUrl: 'onSite/templates/onSite.html',
            controller: 'OnSiteController',
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
