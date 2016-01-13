define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    userContextModule = require('app/common/context/user'),
    projectContextModule = require('app/common/context/project'),
    userNotificationsModule = require('app/common/services/userNotifications');

  var module = angular.module('common.services.account', ['app.config', 'common.context.user', 'common.context.project', 'common.services.userNotifications']);

  module.factory('accountFactory', ['$http', 'appConstant', 'userContext', '$q', '$rootScope', 'projectContext', 'userNotificationsFactory',
    function($http, constant, userContext, $q, $rootScope, projectContext, userNotificationsFactory) {
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
        $http.post(constant.domain + '/user/signin', loginUser, {
          headers: {
            Authorization: false
          }
        })
          .then(function(resp) {
            // Save access token and refresh token
            userContext.setToken(resp.data.token);

            //Get user profile
            if(resp.data.user) {
              services.userDetails({
                "userId": resp.data.user.userId,
                "accountStatus": null
              }).then(function(resp) {
                var userData = angular.extend(resp.data.user, {
                  username: userName
                });

                userContext.fillInfo(userData, true);

                // Get user permission
                services.getUserProfileDetails(resp.data.user.userId)
                  .success(function(resp2) {
                    var newObj = userContext.authentication();
                    newObj.isOwner = resp2.membershipType === 'PROJ_OWNER';
                    userContext.saveLocal(newObj);
                    deferred.resolve();
                  })
                  .error(function(err) {
                    deferred.resolve();
                  });
                //deferred.resolve();
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

      services.changePassword = function(data) {
        return $http.post(constant.domain + '/api/account/ChangePassword', data, {
          headers: {
            'Authorization': false
          }
        });
      };

      //get profile
      services.userDetails = function(user) {
        return $http.post(constant.domain + '/profile/getUserDetails', user, {
          headers: {
            'Authorization': false
          }
        });
      };

      services.getUserProfileDetails = function(userId) {
        return $http.post(constant.domain + '/profile/userProfileInfo', {
          userId: userId
        }, {
          headers: {
            'Authorization': false
          }
        });
      };

      //forgot password
      services.forgotPassword = function(user) {
        return $http.post(constant.domain + '/profile/forgotPasswordRequest', user, {
          headers: {
            'Authorization': false
          }
        });
      };

      services.demoSignup = function(user) {
        return $http.post(constant.domain + '/onTargetInvitation/inviteToNewAccount', user);
      };

      services.validateSignupToken = function(tokendata) {
        return $http.get(constant.domain + '/register/validateLink/?q=' + tokendata);
      };

      services.validateResetPasswordToken = function(tokendata) {
        return $http.get(constant.domain + '/profile/validateForgotPassword/' + tokendata);
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

      services.getUserProjectProfile = function(projectId) {
        return $http.post(constant.domain + '/profile/userProjectProfileInfo', {
            "baseRequest":{
              "loggedInUserId": $rootScope.currentUserInfo.userId,
              "loggedInUserProjectId": projectId ? projectId : $rootScope.currentProjectInfo.projectId ? $rootScope.currentProjectInfo.projectId : 0
            }
          },
          {
            headers: {
              Authorization: false
            }
          });
      };

      return services;
    }]);
  return module;
});