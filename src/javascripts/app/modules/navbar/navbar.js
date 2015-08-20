define(function (require){
  'use strict';
  var angular = require('angular'),
    template = require('text!./templates/navbar.html'),
    controller = require('./controllers/navbar'),
    accountServiceModule = require('app/common/services/account'),
    notificationsServiceModule = require('app/common/services/notifications'),
    showHideCollaborateDirective = require('./directives/showHideCollaborate'),
    angularMoment = require('angularMoment');

  var module = angular.module('app.navbar', ['common.context.user', 'common.services.account', 'common.services.notifications', 'angularMoment']);
  module.run(['$templateCache', function ($templateCache){
    $templateCache.put('navbar/templates/navbar.html', template);
  }]);

  module.controller('NavbarController', controller);

  module.directive('showHideCollaborate', showHideCollaborateDirective);

  return module;
});