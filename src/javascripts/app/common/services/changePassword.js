define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    module;

  module = angular.module('common.services.changePassword', ['app.config']);

  module.factory('changePasswordFactory',
    ['appConstant', '$http',
      function(constant, $http) {
        var service = {};

        service.changePassword = function(param) {
          return $http.post(constant.domain + '/profile/changeUserPassword', param, {
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