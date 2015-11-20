define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    pusherLib = require('pusher'),
    _ = require('lodash'),
    angularLocalStorage = require('angularLocalStorage'),
    pushAngular = require('pushAngular');

  var module = angular.module('common.services.push', ['app.config', 'pusher-angular', 'angularLocalStorage']);

  module.factory('pushFactory', ['$pusher', 'appConstant', '$rootScope', 'storage',
    function($pusher, constant, $rootScope, storage) {
      var services = {},
        client, channel,
        pusher, subscribedChannels = storage.get('onTargetSubscribedChannels') || [];

      services.initialize = function() {
        client = new Pusher(constant.pusher_api_key, {
          encrypted: true
        });
        pusher = $pusher(client);
        channel = pusher.subscribe(constant.pusher_channel);

        channel.unbind('onTargetAll');
        _.each(subscribedChannels, function(el) {
          channel.unbind('el');
        });

        // bind global channel
        pusher.bind('onTargetAll', function(data) {
          $rootScope.$broadcast('pusher.notifications');
        });

        pusher.connection.bind_all(function(eventName, data) {
          // if (eventName == 'state_change') { ...
        });
      };

      services.bind = function(evtName, cb) {
        subscribedChannels.push(evtName);
        storage.set('onTargetSubscribedChannels', subscribedChannels);
        pusher.bind(evtName, cb);
      };

      services.unbind = function(evtName) {
        subscribedChannels = _.without(subscribedChannels, evtName);
        storage.set('onTargetSubscribedChannels', subscribedChannels);
        channel.unbind(evtName);
      };

      return services;
    }]);
  return module;
});