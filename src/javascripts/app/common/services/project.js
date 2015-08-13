/**
 * Created by thophan on 8/11/2015.
 */
define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    module;

  module = angular.module('common.services.project', ['app.config']);

  module.factory('projectFactory',
    ['appConstant', '$http',
      function(constant, $http) {
        var service = {};

        service.getUserProject = function(model) {
          return $http.post(constant.domain + '/project/getProjectsByUser/', model);
        };

        return service;
      }
    ]
  );
});