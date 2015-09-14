/**
 * Created by thophan on 8/19/2015.
 */
define(function(require) {
  'use strict';
  var angular = require('angular'),
    lodash = require('lodash'),
    config = require('app/config'),
    taskSeverities = require('text!app/common/resources/taskSeverities.json'),
    taskStatuses = require('text!app/common/resources/taskStatuses.json');
  var module = angular.module('common.filters.task', ['app.config'])
    .filter('taskSeverity', function() {
      return function(input) {
        switch (input) {
          case '1': return 'CRITICAL';
          case '2': return 'HIGH';
          case '3':return 'LOW';
          default: return _.result(_.find(angular.fromJson(taskSeverities), {id: input}), 'name');
        }
      };
    })
    .filter('taskStatus', function() {
      return function(input) {
        return _.result(_.find(angular.fromJson(taskStatuses), {id: input}), 'name');
      };
    })
    .filter('taskStatusColor', ['appConstant', function(appConstant) {
      return function(percentage) {
        return percentage >= 75 ? appConstant.app.statusColours[0] :
          percentage >= 50 ? appConstant.app.statusColours[1] :
            percentage >= 25 ? appConstant.app.statusColours[2] : appConstant.app.statusColours[3];
      };
    }]);
});