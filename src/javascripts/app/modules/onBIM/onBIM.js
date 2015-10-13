/**
 * Created by aashiskhanal on 10/9/15.
 */
define(function(require) {
  'use strict';
  var angular = require('angular'),
    uiRouter = require('uiRouter'),
    config = require('app/config'),
    template = require('text!./templates/onBIM.html'),
    controller = require('./controllers/onBIM'),
    projectContextModule = require('app/common/context/project'),
    angularLocalStorage = require('angularLocalStorage'),
    onSiteServiceModule = require('app/common/services/onBIM'),
    utilServiceModule = require('app/common/services/util'),
    angularSanitize = require('angularSanitize');

  var module = angular.module('app.onBIM', ['ui.router', 'app.config', 'common.context.project', 'angularLocalStorage', 'ui.select', 'common.services.file', 'common.services.onBIM', 'common.services.util', 'ngSanitize', 'common.services.permission']);

  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('onBIM/templates/onBIM.html', template);
  }]);

  module.controller('OnBIMController', controller);

  module.config(
    ['$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('app.onBIM', {
            url: '/onBIM',
            templateUrl: 'onBIM/templates/onBIM.html',
            controller: 'OnBIMController',
            reloadOnSearch: false,
            resolve: {
              projectValid: ['$location', 'projectContext', '$q', '$state', '$window', 'permissionFactory', function($location, projectContext, $q, $state, $window, permissionFactory) {
                var deferred = $q.defer();
                if(projectContext.valid() && permissionFactory.checkMenuPermission('ONBIM')) {
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
