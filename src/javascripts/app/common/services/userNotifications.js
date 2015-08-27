define(function(require) {
  'use strict';

  var angular = require('angular'),
    config = require('app/config'),
    module;

  module = angular.module('common.services.userNotifications', ['app.config']);

  module.factory('userNotificationsFactory', ['appConstant', '$http', '$q', '$rootScope', '$interval', 'notifications',
    function(constant, $http, $q, $rootScope, $interval, notifications) {
      var service = {}, intervalFunction;

      service.getByPage = function(page, size) {
        if($rootScope.currentProjectInfo) {
          var requestPayload = {
            "pageNumber": page,
            "perPageLimit": size,
            "userId": $rootScope.currentUserInfo.userId
          };

          return $http.post('http://app.ontargetcloud.com:9000/notification/getNotifications/', requestPayload);
        }
      };

      service.getAll = function(param) {
        var deferred = $q.defer();
        if($rootScope.currentUserInfo && $rootScope.currentUserInfo.userId) {
          $http.post(constant.domain + '/notification/getNotifications', param)
            .then(function(resp) {
              $rootScope.userNotifications = resp.data.notificationList;
              notifications.getNotificationSuccess();
              deferred.resolve(resp.notificationList);
            }, function(err) {
              deferred.reject(err);
            });
        }
        return deferred.promise;
      };

      service.startGetAll = function(param, interval) {
        if(!interval) {
          interval = constant.app.settings.userNotificationsInterval;
        }
        if(intervalFunction) {
          return;
        }
        service.getAll(param);
        intervalFunction = $interval(function() {
          service.getAll(param);
        }, interval);
      };

      service.stopGetAll = function() {
        if(intervalFunction) {
          $interval.cancel(intervalFunction);
          intervalFunction = undefined;
        }
      };

      return service;
    }]);
});