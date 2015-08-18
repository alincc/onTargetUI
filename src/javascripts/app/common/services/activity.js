/**
 * Created by thophan on 8/18/2015.
 */
define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    module;

  module = angular.module('common.services.activity', ['app.config']);

  module.factory('activityFactory',
    ['appConstant', '$http',
      function(constant, $http) {
        var service = {};

        service.addActivity = function(model) {
          return $http.post(constant.resourceUrl + '/project/createNewActivity', model);
        };

        service.deleteActivity = function (model){
          return $http.post(constant.resourceUrl + '/tasks/deleteProject', model);
        };

        return service;
      }
    ]
  );
});