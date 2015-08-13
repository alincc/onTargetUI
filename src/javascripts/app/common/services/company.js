define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    module;

  module = angular.module('common.services.company', ['app.config']);

  module.factory('companyFactory',
    ['appConstant', '$http',
      function(constant, $http) {
        var service = {};

        service.search = function() {
          return $http.post(constant.domain + '/company/getCompanyList', {});
        };

        service.get = function(param) {
          return $http.post(constant.domain + '/company/getCompanyInfo', param);
        };

        service.update = function(param) {
          return $http.post(constant.domain + '/profile/updateCompanyInfo', param, {
            headers: {
              AutoAlert: true
            }
          });
        };

        return service;
      }
    ]
  );
});