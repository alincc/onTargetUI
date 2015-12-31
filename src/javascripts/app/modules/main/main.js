define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    controller = require('./controllers/main'),
    template = require('text!./templates/main.html');
  var module = angular.module('app.main', ['app.config']);
  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('main/templates/main.html', template);
  }]);
  module.controller('MainController', controller);
  module.run(['$rootScope', function($rootScope) {
    // Validate Authorization Page
    $rootScope.$on('$stateChangeStart', function(event, toState) {
      $rootScope.isProjectListPage = toState.name === 'app.projectlist';
    });
  }]);
  module.config(
    ['$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('app', {
            url: '/app',
            templateUrl: "main/templates/main.html",
            controller: 'MainController',
            abstract: true,
            resolve: {
              allProjects: [
                '$q',
                'projectFactory',
                'userContext',
                '$rootScope',
                '$state',
                function($q,
                         projectFactory,
                         userContext,
                         $rootScope,
                         $state) {
                  var deferred = $q.defer();
                  console.log('Current state: \'' + $state.current.name + '\'');
                  if($state.current.name === 'signin' || $rootScope.isProjectListPage) {
                    deferred.resolve();
                  }
                  else {
                    projectFactory.getUserProjectList({
                      userId: userContext.authentication().userData.userId
                    }).then(function(resp) {
                        $rootScope.allProjects = resp.data.projects;
                        deferred.resolve();
                      },
                      function() {
                        $rootScope.allProjects = [];
                        deferred.resolve();
                      });
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