define(function(require) {
  'use strict';

  var angular = require('angular'),
    template = require('text!./templates/notifications.html'),
    controller = require('./controllers/notifications'),
    notificationServiceModule = require('app/common/services/notifications'),
    angularMoment = require('angularMoment');

  var module = angular.module('app.notifications', ['angularMoment']);

  module.run(['$templateCache', function ($templateCache) {
    $templateCache.put('notifications/templates/notifications.html', template);
  }]);

  module.controller('NotificationsController', controller);

  module.config(
    ['$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('app.notifications', {
            url: '/notifications',
            templateUrl: "notifications/templates/notifications.html",
            controller: 'NotificationsController'
          });
      }
    ]
  );

  return module;
});