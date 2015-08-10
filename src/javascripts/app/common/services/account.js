define(function (require) {
    'use strict';
    var angular = require('angular'),
        config = require('app/config'),
        userServiceModule = require('./../context/user');
    var module = angular.module('common.services.account', ['app.config', 'common.context.user']);
    module.factory('accountFactory', ['$http', 'appConstant', 'userContext', '$q', function ($http, constant, userContext, $q) {
        var services = {};
        services.register = function (data) {
            return $http.post(constant.domain + '/api/Account/Register', data);
        };
        //login
        services.login = function (userName, password) {
            var deferred = $q.defer();
            var loginUser = {
                username: userName,
                password: password
            };
            $http.post(constant.domain + '/user/signin', loginUser)
                .then(function (resp) {
                    // Save access token and refresh token
                    userContext.setToken(resp.data.token);

                    //Get user profile
                    if (resp.data.user) {
                        var user = {
                            userId: resp.data.user.userId,
                            accountStatus: null
                        };
                        services.getProfile(user).then(
                            function (resp) {
                                userContext.fillInfo(resp.data.user, true);
                                deferred.resolve();
                            }, function (err) {
                                deferred.reject(err);
                            });
                    }
                    else {
                        deferred.reject(resp);
                    }
                }, function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        };


        services.logout = function () {
            var deferred = $q.defer();
            $http.post(constant.domain + '/user/logout', {})
                .then(function () {
                    userContext.clearInfo();
                    deferred.resolve();
                }, function () {
                    userContext.clearInfo();
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

        services.changePassword = function (data) {
            return $http.post(constant.domain + '/api/account/ChangePassword', data, {
                headers: {
                    'Authorization':false
                }
            });
        };

        //get profile
        services.getProfile = function (user) {
            return $http.post(constant.domain + '/profile/getUserDetails', user);
        };

        //forgot password
        services.forgotPassword = function (user) {
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
        services.demoSignup = function (user) {
            return $http.post(constant.baseUrl + '/collaborate/demoSignup', user);
        };

        return services;
    }]);
    return module;
});