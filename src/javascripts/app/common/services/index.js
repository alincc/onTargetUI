define(function(require) {
  'use strict';
  var angular = require('angular'),
    account = require('./account'),
    util = require('./util'),
    notifications = require('./notifications'),
    countriesResource = require('./countries'),
    mock = require('./mock'),
    push = require('./push'),
    onBim = require('./onBim'),
    userNotifications = require('./userNotifications');

  var module = angular.module('common.services',
    [
      //'common.services.mock',
      'common.services.notifications',
      'common.services.account',
      'common.services.util',
      'common.services.countries',
      'common.services.onBim',
      'common.services.userNotifications',
      'common.services.mock',
      'common.services.push',
      'common.services.user'
    ]);
  return module;
});