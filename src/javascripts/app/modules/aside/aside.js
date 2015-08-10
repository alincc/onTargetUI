define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    template = require('text!./templates/aside.html'),
    navTpl = require('text!./templates/nav.html'),
    controller = require('./controllers/aside');

  var module = angular.module('app.aside', ['app.config']);
  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('aside/templates/aside.html', template);
    $templateCache.put('aside/templates/nav.html', navTpl);
  }]);

  module.controller('AsideController', controller);

  return module;
});