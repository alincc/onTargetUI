define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    module;

  module = angular.module('common.services.inviteCollaborator', ['app.config']);

  module.factory('inviteCollaboratorFactory',
    ['appConstant', '$http',
      function(constant, $http) {
        var service = {};

        service.invite = function(param) {
          //return $http.post(constant.domain + '/register/inviteUserIntoProject', param); // cannot post for new comapny
          return $http.post('http://app.ontargetcloud.com:9000/collaborate/new', param);
        };

        return service;
      }
    ]
  );
});