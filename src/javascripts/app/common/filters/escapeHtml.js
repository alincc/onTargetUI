define(function (require) {
  'use strict';

  var angular = require('angular');

  var module = angular.module('common.filters.escapeHtml', [])
    .filter('escapeHtml', function () {
      return function(text) {
        return text ? text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';
      };
    });

  return module;

});
