/**
 * Created by thophan on 8/19/2015.
 */
define(function(require) {
  'use strict';
  var angular = require('angular'),
    module;

  module = angular.module('common.services.document', ['app.config']);

  module.factory('documentFactory',
    ['appConstant', '$http',
      function(constant, $http) {
        var service = {};
        service.getUserDocument = function(projectId) {
          return $http.post(constant.resourceUrl + '/documents/getUserDocument', {
            projectId:projectId
          });
        };
        return service;
      }
    ]
  );
});