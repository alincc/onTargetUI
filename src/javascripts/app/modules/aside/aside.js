define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    template = require('text!./templates/aside.html'),
    navTpl = require('text!./templates/nav.html'),
    controller = require('./controllers/aside'),
    permissionServiceModule = require('app/common/services/permission');

  var module = angular.module('app.aside', ['app.config', 'common.services.permission']);
  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('aside/templates/aside.html', template);
    $templateCache.put('aside/templates/nav.html', navTpl);
  }]);

  module.controller('AsideController', controller);

  return module;
});