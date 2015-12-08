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
        // Create instance
        client = new Pusher(constant.pusher_api_key, {
          encrypted: true
        });
        pusher = $pusher(client);

        // Subscribe channel
        channel = pusher.subscribe(constant.pusher_channel);

        // Unbind old events
        services.unbindAll(true);

        services.bindGlobalChannel();

        pusher.connection.bind_all(function(eventName, data) {
          // if (eventName == 'state_change') { ...
        });
      };

      services.bindGlobalChannel = function() {
        console.log('Listen global events: onTargetAll');
        // bind global channel
        channel.bind('onTargetAll', function(data) {
          $rootScope.$broadcast('pusher.notifications');
        });
      };

      services.bind = function(evtName, cb) {
        console.log('Listen event: ' + evtName);
        subscribedChannels.push(evtName);
        storage.set('onTargetSubscribedChannels', subscribedChannels);
        channel.bind(evtName, cb);
      };

      services.unbind = function(evtName) {
        console.log('UnListen event: ' + evtName);
        subscribedChannels = _.without(subscribedChannels, evtName);
        storage.set('onTargetSubscribedChannels', subscribedChannels);
        channel.unbind(evtName);
      };

      services.unbindAll = function(global) {
        console.log('UnListen all events');
        if(global) {
          channel.unbind('onTargetAll');
        }

        _.each(subscribedChannels, function(evtName) {
          channel.unbind(evtName);
        });
        subscribedChannels = [];
        storage.set('onTargetSubscribedChannels', []);
      };

      return services;
    }]);
  return module;
});