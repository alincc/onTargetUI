/**
 * Created by thophan on 8/27/2015.
 */
define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    projectService = require('app/common/services/project'),
    activityService = require('app/common/services/activity'),
    userContext = require('app/common/context/user'),
    projectContext = require('app/common/context/project'),
    ganttChartController = require('./controllers/ganttChart'),
    ganttChartTemplate = require('text!./templates/ganttChart.html'),
    angularGantt = require('angularGantt'),
    angularGanttPlugin = require('angularGanttPlugin'),
    angularUiTree = require('angularUiTree');
  var module = angular.module('app.ganttChart', ['ui.router', 'app.config', 'common.services.project', 'common.context.user', 'common.context.project', 'common.services.activity',
    'ui.tree',
    'gantt',
    'gantt.movable',
    'gantt.drawtask',
    'gantt.tooltips',
    'gantt.bounds',
    'gantt.progress',
    'gantt.table',
    'gantt.tree',
    'gantt.groups']);

  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('onTime/ganttChart/templates/ganttChart.html', ganttChartTemplate);
  }]);

  module.controller('GanttChartController', ganttChartController);

  return module;
});
