define(function(require) {
  'use strict';
  var angular = require('angular'),
    gapiService = require('async!https://apis.google.com/js/client.js!onload'),
    module;

  module = angular.module('common.services.googleDrive', ['app.config']);

  module.factory('googleDriveFactory',
    ['appConstant', '$q',
      function(constant, $q) {
        var service = {};

        service.authorize = function() {
          var deferred = $q.defer();

          function handleAuthResult(authResult) {
            console.log(authResult);
            if(authResult && !authResult.error) {
              // Hide auth UI, then load client library.
              deferred.resolve();
            } else {
              // Show auth UI, allowing the user to initiate authorization by
              // clicking authorize button.
              deferred.reject();
            }
          }

          gapi.auth.authorize(
            {
              client_id: '119225888070-pkccaemomn8ksb6i2nvdj8q124koomdm.apps.googleusercontent.com',
              scope: ['https://www.googleapis.com/auth/drive.metadata.readonly'],
              immediate: false
            },
            handleAuthResult);

          return deferred.promise;
        };

        service.loadFiles = function() {
          var deferred = $q.defer();

          function listFiles() {
            var request = gapi.client.drive.files.list({
              'maxResults': 10
            });

            request.execute(function(resp) {
              deferred.resolve(resp.items);
            });
          }

          service.authorize()
            .then(function() {
              gapi.client.load('drive', 'v2', listFiles);
            });
          return deferred.promise;
        };

        return service;
      }
    ]
  );
});