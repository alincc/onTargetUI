
define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    projectService = require('app/common/services/project'),
    activityService = require('app/common/services/activity'),
    userContext = require('app/common/context/user'),
    projectContext = require('app/common/context/project'),
    ganttChartController = require('./controllers/customGanttChart'),
    customGanttChart = require('text!./templates/customGanttChart.html'),
    customGanttChartTemplate = require('text!./templates/ganttChartTemplate.html'),
    angularGantt = require('angularGantt'),
    angularGanttPlugin = require('angularGanttPlugin'),
    angularUiTree = require('angularUiTree'),
    notificationServiceModule= require('app/common/services/notifications');
  var module = angular.module('app.customGanttChart', ['ui.router', 'app.config', 'common.services.project', 'common.context.user', 'common.context.project', 'common.services.activity','common.services.notifications',
    'ui.tree',
    'gantt',
    'gantt.movable',
    'gantt.drawtask',
    'gantt.tooltips',
    'gantt.bounds',
    'gantt.progress',
    'gantt.table',
    'gantt.tree',
    'gantt.groups',
    'gantt.overlap']);

  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('onTime/customGanttChart/templates/customGanttChart.html', customGanttChart);
    $templateCache.put('onTime/customGanttChart/templates/customGanttChartTemplate.html', customGanttChartTemplate);
  }]);

  module.controller('CustomGanttChartController', ganttChartController);

  return module;
});
