define(function(require) {
  'use strict';
  var angular = require('angular'),
    module;

  module = angular.module('common.services.box', ['app.config']);

  module.factory('boxFactory',
    ['appConstant', '$q', '$http',
      function(constant, $q, $http) {
        var service = {},
          boxSelect;

        service.authorize = function() {

          //https://box-content.readme.io/docs/oauth-20
          //https://box-content.readme.io/docs/get-started-with-the-box-api
          //https://app.box.com/api/oauth2/authorize?response_type=code&client_id=4uwduc0lxnvz2whx04phymwyd6t78gy2

          //http://localhost:9000/?state=&code=gfS0HbFRmgZMwfDQyuEHea9IEiFlGWC6

          return $http.post('https://app.box.com/api/oauth2/token', {
            grant_type: 'authorization_code',
            client_id: 't5sfo0x515refc4tx9e13xy7p9n48v7q',
            client_secret: 'onTargetNOIS',
            code: ''
          });

          //return deferred.promise;
        };

        service.loadFiles = function() {
          console.log('hey 1');
          service.authorize()
            .then(function() {
              console.log(boxSelect);
              boxSelect.launchPopup();
            });
        };

        return service;
      }
    ]
  );
});