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

        service.getActivityOfProject = function(projectId, canceler, baseRequest) {
          canceler = canceler || $q.defer();
          var authData, authorization = true;
          if(angular.isDefined(baseRequest) && baseRequest === false){
            authorization = false;
            authData = {
              "loggedInUserId": $rootScope.currentUserInfo.userId,
              "loggedInUserProjectId": projectId
            };
          }

          return $http.post(constant.domain + '/project/getActivityOfProject', {
            projectId: projectId,
            baseRequest: authData
          }, {
            timeout: canceler.promise,
            headers: {
              Authorization: authorization
            }
          });
        };

        service.getActivityById = function(activityId){
          return $http.post(constant.domain + '/project/getProject', {
            projectId: activityId
          });
        };

        service.addActivity = function(model) {
          return $http.post(constant.domain + '/project/addActivity', model, {
            headers: {
              AutoAlert: true
            }
          });
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