define(function(require) {
  'use strict';
  var angular = require('angular'),
    angularLocalStorage = require('angularLocalStorage'),
    module;

  module = angular.module('common.services.box', ['app.config', 'angularLocalStorage']);

  module.factory('boxFactory',
    ['appConstant', '$q', '$http', 'storage',
      function(constant, $q, $http, storage) {
        var service = {},
          token, refreshToken,
          clientId = 't5sfo0x515refc4tx9e13xy7p9n48v7q',
          clientSecret = 'mnIGltu4VmpzAHSYNaPQCNt2ZpEMmG5Z',
          returnUrl = encodeURIComponent('http://' + window.location.host);

        function loadAuthData() {
          var authData = storage.get('BoxAuthentication');
          if(authData) {
            token = authData.access_token;
            refreshToken = authData.refresh_token;
          }
        }

        service.revoke = function() {
          loadAuthData();
          if(token && refreshToken) {
            $http.post('https://api.box.com/oauth2/revoke', 'client_id=' + clientId + '&client_secret=' + clientSecret + '&token=' + token, {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded"
              }
            });
          }
        };

        service.authorize = function() {
          var deferred = $q.defer();
          loadAuthData();

          if(token && refreshToken) {
            deferred.resolve();
            return deferred.promise;
          }

          window.open('https://app.box.com/api/oauth2/authorize?response_type=code&client_id=' + clientId + '&redirect_uri=' + returnUrl + '&state=onTarget', 'Box Authentication', 'height=500,width=500');
          window.addEventListener('OauthReturn', function(e, a) {
            window.removeEventListener('OauthReturn');
            var code = e.detail.access_token;
            var data = "grant_type=authorization_code&code=" + code + "&client_id=" + clientId + "&client_secret=" + clientSecret;
            $http.post('https://api.box.com/oauth2/token', data, {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded"
              }
            })
              .success(function(resp) {
                //{
                //  "access_token": "debiQcKmrSetE8qrO4sBcLcdPbqotxWp",
                //  "expires_in": 4259,
                //  "restricted_to": [],
                //  "refresh_token": "XsFqvZM94ab9HfA3UKCbBstk8DnNVZvSrvRKefqN5TXCqNZwESCBcehtL5MBzRzY",
                //  "token_type": "bearer"
                //}
                console.log(resp);
                token = resp.access_token;
                refreshToken = resp.refresh_token;
                storage.set('BoxAuthentication', {access_token: token, refresh_token: refreshToken});
                deferred.resolve();
              })
              .error(function(err) {
                console.log(err);
                deferred.reject();
              });
          });
          return deferred.promise;
        };

        service.refreshToken = function() {
          var deferred = $q.defer();
          $http.post('https://api.box.com/oauth2/token', 'grant_type=refresh_token&refresh_token=' + refreshToken + '&client_id=' + clientId + '&client_secret=' + clientSecret, {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            }
          })
            .success(function(resp) {
              //{ "access_token": "T9cE5asGnuyYCCqIZFoWjFHvNbvVqHjl", "expires_in": 3600, "restricted_to": [], "token_type": "bearer", "refresh_token": "J7rxTiWOHMoSC1isKZKBZWizoRXjkQzig5C6jFgCVJ9bUnsUfGMinKBDLZWP9BgR" }
              token = resp.access_token;
              refreshToken = resp.refresh_token;
              storage.set('BoxAuthentication', {access_token: token, refresh_token: refreshToken});
              deferred.resolve();
            })
            .error(function(err) {
              console.log(err);
              deferred.reject();
            });
          return deferred.promise;
        };

        service.loadData = function(folderId, from, take) {
          var deferred = $q.defer();
          service.authorize()
            .then(function() {
              $http.get('https://api.box.com/2.0/folders/' + folderId + '/items', {
                params: {
                  limit: take,
                  offset: from
                },
                headers: {
                  "Authorization": "Bearer " + token
                }
              })
                .success(function(resp) {
                  deferred.resolve(resp);
                })
                .error(function(err) {
                  deferred.reject(err);
                });
            });
          return deferred.promise;
        };

        return service;
      }
    ]
  );
});