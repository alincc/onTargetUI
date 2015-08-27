define(function(require) {
  'use strict';
  var angular = require('angular'),
    angularLocalStorage = require('angularLocalStorage'),
    utilServiceModule = require('app/common/services/util'),
    gapiService = require('async!https://apis.google.com/js/client.js!onload'),
    module;

  module = angular.module('common.services.googleDrive', ['app.config', 'angularLocalStorage', 'common.services.util']);

  module.factory('googleDriveFactory',
    ['appConstant', '$q', 'storage', '$http', 'utilFactory',
      function(constant, $q, storage, $http, utilFactory) {
        var service = {},
          isAuthorized = false,
          isLogged = false,
          nextPageToken = null,
          token = null;

        service.validateToken = function() {
          var deferred = $q.defer();
          var authData = storage.get('GoogleDriveAuthentication');
          isAuthorized = authData ? authData.isAuthorized : false;
          token = authData ? authData.token : null;

          if(isAuthorized && token) {
            $http.get('https://www.googleapis.com/oauth2/v1/tokeninfo', {
              params: {
                access_token: token
              }
            })
              .success(function(resp) {
                if(angular.isDefined(resp.expires_in)) {
                  deferred.resolve();
                } else {
                  deferred.reject();
                }
              })
              .error(function(err) {
                console.log(err);
                deferred.reject();
              });
          }
          else {
            deferred.reject();
          }
          return deferred.promise;
        };

        service.authorize = function() {
          var deferred = $q.defer();

          function handleAuthResult(authResult) {
            console.log(authResult);
            if(authResult && !authResult.error) {
              // Hide auth UI, then load client library.
              isAuthorized = true;
              isLogged = true;
              token = authResult.access_token;
              storage.set('GoogleDriveAuthentication', {isAuthorized: isAuthorized, token: token});
              deferred.resolve();
            } else {
              // Show auth UI, allowing the user to initiate authorization by
              // clicking authorize button.
              deferred.reject();
            }
          }

          if(!isLogged) {
            gapi.auth.authorize(
              {
                client_id: '119225888070-pkccaemomn8ksb6i2nvdj8q124koomdm.apps.googleusercontent.com',
                scope: ['https://www.googleapis.com/auth/drive.metadata.readonly'],
                immediate: isAuthorized
              },
              handleAuthResult);
          }
          else {
            deferred.resolve();
          }

          return deferred.promise;
        };

        service.loadFiles = function(dir, kw) {
          var deferred = $q.defer();

          function listFiles() {
            var payload = {
              'maxResults': 10
            };

            if(dir === 'next' && nextPageToken) {
              payload.pageToken = nextPageToken;
            }

            if(kw) {
              payload.q = "title contains '" + kw + "'";
            }

            var request = gapi.client.drive.files.list(payload);

            request.execute(function(resp) {
              nextPageToken = resp.nextPageToken;
              deferred.resolve(resp.items);
            });
          }

          service.authorize()
            .then(function() {
              gapi.client.load('drive', 'v2', listFiles);
            });
          return deferred.promise;
        };

        service.downloadFile = function(url, fileName) {
          var downloadUrl = url;
          if(url.indexOf('?') > -1) {
            downloadUrl = downloadUrl + '&access_token=' + token
          }
          return $http.post(constant.nodeServer + '/node/download', {
            uuid: utilFactory.newGuid(),
            fileName: fileName,
            url: downloadUrl
          }, {
            headers: {
              'content-type': 'application/json'
            }
          });
        };

        return service;
      }
    ]
  );
});