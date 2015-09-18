define([
  'angular',
  'angularLocalStorage'
], function(angular){
  'use strict';
  var module = angular.module('common.context.user', ['angularLocalStorage']);
  module.factory('userContext', ['storage', '$q', '$rootScope', function(storage, $q, $rootScope){
    var service = {},
      authentication = {
        isAuth: false,
        token: '',
        userData: {}
      };
    $rootScope.currentUserInfo = authentication.userData;

    service.setToken = function(token){
      if(!token) {
        authentication.isAuth = false;
        authentication.token = undefined;
        this.clearInfo();
      } else {
        authentication.isAuth = true;
        authentication.token = token;
      }
      service.saveLocal(authentication);
    };

    service.fillInfo = function(obj, rememberMe){
      authentication.userData = angular.extend(authentication.userData, obj);
      $rootScope.currentUserInfo = authentication.userData;
      // Save data to local storage
      if(rememberMe) {
        service.saveLocal(authentication);
      }
    };

    service.clearInfo = function(){
      authentication.userData = {};
      $rootScope.currentUserInfo = {};
      authentication.token = '';
      authentication.isAuth = false;
      service.saveLocal(authentication);
    };

    service.saveLocal = function(obj){
      obj = obj || {};
      storage.set('authenticationData', obj);
    };

    service.loadFromLocal = function(){
      var data = storage.get('authenticationData');
      data = data || {};
      authentication = data;
      $rootScope.currentUserInfo = authentication.userData;
      service.setToken(data.token);
    };

    service.signOut = function(){
      var deferred = $q.defer();
      service.clearInfo();
      deferred.resolve();
      return deferred.promise;
    };

    service.authentication = function(){
      return authentication;
    };

    return service;
  }]);
  return module;
});