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
    ['appConstant', '$http', '$q',
      function(constant, $http, $q) {
        var service = {};

        service.getActivityOfProject = function(projectId, canceler){
          canceler = canceler || $q.defer();
          return $http.post(constant.domain + '/project/getActivityOfProject', {
            projectId: projectId
          }, {
            timeout: canceler.promise
          });
        };

        service.getActivityById = function(activityId){
          return $http.post(constant.domain + '/project/getProject', {
            projectId: activityId
          });
        };

        service.addActivity = function(model) {
          return $http.post(constant.domain + '/project/addActivity', model);
        };

        service.deleteActivity = function(model) {
          return $http.post(constant.domain + '/project/deleteProject', model, {
            headers: {
              AutoAlert: true
            }
          });
        };

        service.import = function(data) {
          return $http.post(constant.domain + '/uploadActivity', data);
        };

        return service;
      }
    ]
  );
});