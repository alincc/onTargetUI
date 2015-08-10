define(function(require) {
  'use strict';
  var angular = require('angular'),
    emulateButton = require('./emulatebutton'),
    autoFocus = require('./autoFocus'),
    validFile = require('./validFile'),
    autoGrow = require('./autoGrow'),
    uiToggleClass = require('./uiToggleClass'),
    app = require('./app'),
    userAvatar = require('./userAvatar'),
    ngMatch = require('./ngMatch'),
    noBreak = require('./noBreak');

  var module = angular.module('common.directives',
    [
      'common.directives.emulatebutton',
      'common.directives.autoFocus',
      'common.directives.autoGrow',
      'common.directives.validFile',
      'common.directives.uiToggleClass',
      'common.directives.app',
      'common.directives.ngMatch',
      'common.directives.userAvatar',
      'common.directives.noBreak']);
  return module;
});