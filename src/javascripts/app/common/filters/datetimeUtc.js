define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    moment = require('moment');

  var module = angular.module('common.filters.datetimeUtc', ['app.config'])
    .filter('datetimeUtc', ['appConstant', function(constant) {
      return function(date, format) {
        if(!date) {
          return undefined;
        }

        if(!format) {
          format = 'YYYY-MM-DD HH:mm:ss';
        }

        var dateUtc = new Date(moment(date).utc().format(format));
        return dateUtc;
      };
    }])

    .filter('datetimeLocal', ['appConstant', function(constant) {
      return function(dateUtc, format) {
        if(!dateUtc) {
          return undefined;
        }

        if(!format) {
          format = 'YYYY-MM-DD HH:mm:ss';
        }

        var date = new Date(moment(dateUtc).local().format(format));
        return date;
      };
    }])

      .filter('datetime', ['appConstant', function(constant) {
        return function(dateUtc, format) {
          if(!dateUtc) {
            return undefined;
          }

          if(!format) {
            format = 'YYYY-MM-DD HH:mm:ss';
          }

          var date = new Date(moment(dateUtc).format(format));
          return date;
        };
      }])
    ;

  return module;
});

