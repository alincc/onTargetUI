define(function(require) {
  'use strict';
  var angular = require('angular'),
    angularLocalStorage = require('angularLocalStorage'),
    module;

  module = angular.module('common.services.dropBox', ['app.config', 'angularLocalStorage']);

  module.factory('dropBoxFactory',
    ['appConstant', '$q', '$http', 'storage',
      function(constant, $q, $http, storage) {
        var service = {},
          token,
          clientId = 'qmrfotonkpkkwh8',
          returnUrl = encodeURIComponent('http://'+window.location.host);

        function loadAuthData(){
          var authData = storage.get('DropBoxAuthentication');
          if(authData) {
            token = authData.access_token;
          }
        }

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

          window.open('https://www.dropbox.com/1/oauth2/authorize?response_type=token&client_id='+clientId+'&redirect_uri='+returnUrl, 'DropBox Authentication', 'height=500,width=500');
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
              $http.get('https://api.dropboxapi.com/1/metadata/auto'+path, {
                params: {
                  file_limit: take
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