define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    userContextModule = require('app/common/context/user'),
    projectContextModule = require('app/common/context/project');
  var module = angular.module('common.services.account', ['app.config', 'common.context.user', 'common.context.project']);
  module.factory('accountFactory', ['$http', 'appConstant', 'userContext', '$q', '$rootScope', 'projectContext', function($http, constant, userContext, $q, $rootScope, projectContext) {
    var services = {};
    services.register = function(data) {
      return $http.post(constant.domain + '/collaborate/registernewuser', data);
    };
    //login
    services.login = function(userName, password) {
      var deferred = $q.defer();
      var loginUser = {
        username: userName,
        password: password
      };
      $http.post(constant.domain + '/user/signin', loginUser)
        .then(function(resp) {
          // Save access token and refresh token
          userContext.setToken(resp.data.token);

          //Get user profile
          if(resp.data.user) {
            var user = {
              userId: resp.data.user.userId,
              accountStatus: null
            };
            services.getProfile(user).then(
              function(resp) {
                var userData = angular.extend(resp.data.user, {
                  username: userName
                });
                userContext.fillInfo(userData, true);
                deferred.resolve();
              }, function(err) {
                deferred.reject(err);
              });
          }
          else {
            deferred.reject(resp);
          }
        }, function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    };

    services.logout = function() {
      var deferred = $q.defer();
      $http.post(constant.domain + '/user/logout', null, {
        params: {
          'username': $rootScope.currentUserInfo.username
        }
      })
        .then(function() {
          userContext.clearInfo();
          projectContext.clearInfo();
          deferred.resolve();
        }, function() {
          userContext.clearInfo();
          projectContext.clearInfo();
          deferred.resolve();
        }
      );
      return deferred.promise;
    };

    //{
    //  "OldPassword": "sample string 1",
    //  "NewPassword": "sample string 2",
    //  "ConfirmPassword": "sample string 3"
    //}

    services.changePassword = function(data) {
      return $http.post(constant.domain + '/api/account/ChangePassword', data, {
        headers: {
          'Authorization': false
        }
      });
    };

    //get profile
    services.getProfile = function(user) {
      return $http.post(constant.domain + '/profile/getUserDetails', user);
    };

    //forgot password
    services.forgotPassword = function(user) {
      return $http.post(constant.domain + '/profile/forgotPasswordRequest', user, {
        headers: {
          'Authorization': false
        }
      });
    };

    //
    //services.resetPassword = function(token, password) {
    //  return $http.post(constant.domain + '/api/account/resetpassword', {token: token, password: password});
    //};

    services.demoSignup = function(user) {
      return $http.post(constant.domain + '/onTargetInvitation/inviteToNewAccount', user);
    };

    services.validateSignupToken = function(tokendata) {
      return $http.post(constant.resourceUrl + '/collaborate/validatetoken/' + tokendata, null);
    };

    services.validateResetPasswordToken = function(tokendata) {
      return $http.post(constant.resourceUrl + '/profile/validateForgotPasswordToken/' + tokendata, null);
    };

    services.resetForgotPassword = function(model) {
      return $http.post(constant.domain + "/profile/changeForgotPassword", model, {
        headers: {
          'Authorization': false
        }
      });
    };

    services.registerOntargetUser = function(formdata) {
      return $http.post(constant.domain + "/register/createUser/", formdata, {
        headers: {
          AutoAlert: true
        }
      });
    };

    services.updateProfile = function(userInfo) {
      return $http.post(constant.domain + '/profile/updateUserProfile', {
          userProfileInfo: userInfo
        },
        {
          headers: {
            AutoAlert: true
          }
        });
    };

    services.getSafety = function() {
      return $http.get(constant.domain + '/profile/getSafetyInfoForUser', {
        params: {
          userId: $rootScope.currentUserInfo.userId
        }
      });
    };

    return services;
  }]);
  return module;
});