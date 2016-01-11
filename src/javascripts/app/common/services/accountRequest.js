define(function(require) {
  'use strict';
  var angular = require('angular'),
    userContext = require('app/common/context/user'),
    config = require('app/config');
  var module = angular.module('common.services.accountRequest', ['app.config']);
  module.factory('accountRequestFactory', ['$http', 'appConstant', '$q', function($http, constant, $q) {
    var services = {};

    services.search = function(params) {
      return $http.post(constant.domain + '/onTargetInvitation/pendingRegistrationRequest', null, {
        headers: {
          Authorization: false
        }
      });
    };

    services.approve = function(requestId) {
      return $http.post(constant.domain + '/onTargetInvitation/approvalRequest', null, {
        headers: {
          Authorization: false,
          AutoAlert: true
        },
        params: {
          id: requestId
        }
      });
    };

    services.reject = function(requestId) {
      return $http.post(constant.domain + '/onTargetInvitation/rejectRequest', null, {
        headers: {
          Authorization: false,
          AutoAlert: true
        },
        params: {
          id: requestId
        }
      });
    };

    return services;
  }]);
  return module;
});