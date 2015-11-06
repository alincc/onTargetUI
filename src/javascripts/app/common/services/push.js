define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    pusherLib = require('pusher'),
    pushAngular = require('pushAngular');

  var module = angular.module('common.services.push', ['app.config', 'pusher-angular']);

  module.factory('pushFactory', ['$pusher', 'appConstant', '$rootScope',
    function($pusher, constant, $rootScope) {
      var services = {},
        client, channel,
        pusher;

      services.initialize = function() {
        client = new Pusher(constant.pusher_api_key, {
          encrypted: true
        });
        pusher = $pusher(client);
        channel = pusher.subscribe(constant.pusher_channel);

        channel.unbind('onTargetAll');

        // bind global channel
        pusher.bind('onTargetAll', function(data) {
          $rootScope.$broadcast('pusher.notifications');
        });

        pusher.connection.bind_all(function(eventName, data) {
          // if (eventName == 'state_change') { ...
        });
      };

      services.bind = function(evtName, cb) {
        pusher.bind(evtName, cb);
      };

      services.unbind = function(evtName) {
        channel.unbind(evtName);
      };
      return services;
    }]);
  return module;
});