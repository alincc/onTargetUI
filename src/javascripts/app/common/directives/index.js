define(function(require) {
  'use strict';
  var angular = require('angular'),
    emulateButton = require('./emulatebutton'),
    autoFocus = require('./autoFocus'),
    validFile = require('./validFile'),
    autoGrow = require('./autoGrow'),
    uiToggleClass = require('./uiToggleClass'),
    app = require('./app'),
    filePath = require('./filePath'),
    ngMatch = require('./ngMatch'),
    noBreak = require('./noBreak'),
    loadingBar = require('./loadingBar'),
    spinner = require('./spinner'),
    permission = require('./permission'),
    menuPermission = require('./menuPermission'),
    loadingButton = require('./loadingButton'),
    pdfPreview = require('./pdfPreview');

  var module = angular.module('common.directives',
    [
      'common.directives.emulatebutton',
      'common.directives.autoFocus',
      'common.directives.autoGrow',
      'common.directives.validFile',
      'common.directives.uiToggleClass',
      'common.directives.app',
      'common.directives.ngMatch',
      'common.directives.filePath',
      'common.directives.noBreak',
      'common.directives.loadingBar',
      'common.directives.spinner',
      'common.directives.permission',
      'common.directives.menuPermission',
      'common.directives.loadingButton',
      'common.directives.pdfPreview'
    ]);
  return module;
});