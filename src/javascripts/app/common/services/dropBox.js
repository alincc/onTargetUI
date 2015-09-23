define(function(require) {
  'use strict';
  var angular = require('angular'),
    angularLocalStorage = require('angularLocalStorage'),
    utilServiceModule = require('app/common/services/util'),
    module;

  module = angular.module('common.services.dropBox', ['app.config', 'angularLocalStorage', 'common.services.util']);

  module.factory('dropBoxFactory',
    ['appConstant', '$q', '$http', 'storage', 'utilFactory',
      function(constant, $q, $http, storage, utilFactory) {
        var service = {},
          token,
          clientId = constant.externalFiles.dropBox.client_id,
          returnUrl = encodeURIComponent('http://' + window.location.host);

        function loadAuthData() {
          var authData = storage.get('DropBoxAuthentication');
          if(authData) {
            token = authData.access_token;
          }
        }

        service.isAuth = function() {
          loadAuthData();
          return angular.isDefined(token);
        };

        service.revoke = function() {
          loadAuthData();
          if(token) {
            $http.post('https://api.dropboxapi.com/1/disable_access_token', null, {
              headers: {
                "Authorization": "Bearer " + token
              }
            });
          }
        };

        service.authorize = function() {
          var deferred = $q.defer();
          loadAuthData();

          if(token) {
            deferred.resolve();
            return deferred.promise;
          }

          window.open('https://www.dropbox.com/1/oauth2/authorize?response_type=token&client_id=' + clientId + '&redirect_uri=' + returnUrl, 'DropBox Authentication', 'height=500,width=500');
          window.addEventListener('OauthReturn', function(e, a) {
            window.removeEventListener('OauthReturn');
            token = e.detail.access_token;
            storage.set('DropBoxAuthentication', {access_token: token});
            deferred.resolve();
          });
          return deferred.promise;
        };

        service.loadData = function(path, take) {
          var deferred = $q.defer();
          service.authorize()
            .then(function() {
              $http.get(constant.nodeServer + '/node/files/dropbox', {
                params: {
                  file_limit: take,
                  path: encodeURIComponent(path),
                  access_token: token
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

        service.downloadFile = function(url, fileName) {
          var downloadUrl = url;
          downloadUrl = downloadUrl + '?access_token=' + token;
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