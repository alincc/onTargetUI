define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    uiRouter = require('uiRouter'),
    controller = require('./controllers/activity'),
    template = require('text!./templates/activity.html'),
    ngScrollable = require('ngScrollable');
  var module = angular.module('app.activity', ['ui.router', 'app.config', 'ngScrollable']);

  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('onTime/activity/templates/activity.html', template);
  }]);

  module.controller('ActivityController', controller);

  return module;
});
