define(function(require) {
  'use strict';
  var angular = require('angular'),
    uiRouter = require('uiRouter'),
    config = require('app/config'),
    onBimTemplate = require('text!./templates/onBim.html'),
    listProjectTemplate = require('text!./templates/listProject.html'),
    addProjectTemplate = require('text!./templates/addProject.html'),
    onBimController = require('./controllers/onBim'),
    listProjectController = require('./controllers/listProject'),
    addProjectController = require('./controllers/addProject'),
    onBimFactory = require('app/common/services/onBim');

  var module = angular.module('app.onBim', [
    'ui.router',
    'app.config',
    'common.services.onBim'
  ]);

  module.run([
    '$templateCache',
    '$rootScope',
    '$state',
    function($templateCache,
             $rootScope,
             $state) {
      $templateCache.put('onBim/templates/onBim.html', onBimTemplate);
      $templateCache.put('listProject/templates/listProject.html', listProjectTemplate);
      $templateCache.put('addProject/templates/addProject.html', addProjectTemplate);
    }]);

  module.controller('OnBimController', onBimController);
  module.controller('OnBimListProjectController', listProjectController);
  module.controller('OnBimAddProjectController', addProjectController);

  module.config(
    ['$stateProvider', '$urlRouterProvider',
      function($stateProvider, $urlRouterProvider) {
        $stateProvider
          .state('app.onBim', {
            url: '/onBim',
            templateUrl: 'onBim/templates/onBim.html',
            controller: 'OnBimController',
            abstract: true,
            resolve: {
              authorization: ['$q', 'onBimFactory', function($q, onBimFactory) {
                var deferred = $q.defer();
                onBimFactory.login()
                  .then(function() {
                    //console.log($state.href('app.onBim.listProject'));
                    //$location.href($state.href('app.onBim.listProject'));
                    deferred.resolve();
                  }, function(err) {
                    console.log(err);
                    deferred.reject();
                  });
                return deferred.promise;
              }]
            }
          })
          .state('app.onBim.listProject', {
            url: '/list-project',
            templateUrl: 'listProject/templates/listProject.html',
            controller: 'OnBimListProjectController',
            reloadOnSearch: false
          })
          .state('app.onBim.addProject', {
            url: '/add-project',
            templateUrl: 'addProject/templates/addProject.html',
            controller: 'OnBimAddProjectController',
            reloadOnSearch: false
          });
      }
    ]
  );

  return module;
});
