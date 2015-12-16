define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    controller = require('./controllers/company'),
    template = require('text!./templates/company.html'),
    companyServiceModule = require('app/common/services/company');

  var module = angular.module('app.company', ['app.config', 'common.services.company']);

  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('editCompany/templates/company.html', template);
  }]);
  module.controller('CompanyController', controller);
  module.config(
    ['$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('app.company', {
            url: '/company',
            templateUrl: "editCompany/templates/company.html",
            controller: 'CompanyController',
            resolve: {
              company: ['companyFactory', '$q', '$rootScope', function(companyFactory, $q, $rootScope) {
                var deferred = $q.defer();

                companyFactory.get({
                  "companyId" : 0 // mainproject
                }).success(function(response) {
                  deferred.resolve(response.company);
                }).error(function(response) {
                  deferred.reject(response);
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