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
                  function($q,
                           projectFactory,
                           userContext,
                           $rootScope) {
                    var deferred = $q.defer();
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
                    return deferred.promise;
                  }]
              }
          });
      }
    ]
  );
  return module;
});