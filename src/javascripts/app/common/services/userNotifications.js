define(function(require){
  'use strict';

  var angular = require('angular'),
    config = require('app/config'),
    module;

  module = angular.module('common.services.userNotifications', ['app.config']);

  module.factory('userNotificationsFactory', ['appConstant', '$http', '$q', '$rootScope', '$interval', 'notifications',
    function(constant, $http, $q, $rootScope, $interval, notifications){
      var service = {}, intervalFunction;

      service.getByPage = function(page, size){
        if($rootScope.currentProjectInfo) {
          var requestPayload = {
            "pageNumber": page,
            "perPageLimit": size,
            "userId": $rootScope.currentUserInfo.userId
          };

          return $http.post(constant.domain + '/notification/getNotifications', requestPayload);
        }
      };

      service.getAll = function(param){
        var deferred = $q.defer();
        if($rootScope.currentUserInfo && $rootScope.currentUserInfo.userId) {

          var data = {
            "pageNumber": param.pageNumber,
            "perPageLimit": param.perPageLimit,
            "userId": $rootScope.currentUserInfo.userId
          };

          $http.post(constant.domain + '/notification/getNotifications', data)
            .then(function(resp){
              $rootScope.userNotifications = resp.data.notificationList;
              notifications.getNotificationSuccess();
              deferred.resolve(resp.notificationList);
            }, function(err){
              deferred.reject(err);
            });
        }
        return deferred.promise;
      };

      //service.startGetAll = function(param, interval) {
      //  if(!interval) {
      //    interval = constant.app.settings.userNotificationsInterval;
      //  }
      //  if(intervalFunction) {
      //    return;
      //  }
      //  service.getAll(param);
      //  intervalFunction = $interval(function() {
      //    service.getAll(param);
      //  }, interval);
      //};
      //
      //service.stopGetAll = function() {
      //  if(intervalFunction) {
      //    $interval.cancel(intervalFunction);
      //    intervalFunction = undefined;
      //  }
      //};

      return service;
    }]);
});