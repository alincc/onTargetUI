/**
 * Created by thophan on 8/27/2015.
 */
define(function(require) {
  'use strict';
  var angular = require('angular'),
    lodash = require('lodash');
  var controller = ['$scope', '$rootScope', 'projectFactory', 'userContext', '$q', 'notifications',
    function($scope, $rootScope, projectFactory, userContext, $q, notifications) {

      $scope.activities = [];
      $scope.isLoadingGanttChart = false;
      var canceler;
      $scope.options = {
        mode: 'custom',
        scale: 'month',
        sortMode: undefined,
        sideMode: 'TreeTable',
        daily: false,
        maxHeight: false,
        width: false,
        zoom: 1,
        autoExpand: 'none',
        taskOutOfRange: 'truncate',
        toDate: undefined,
        rowContent: '<i class="fa fa-align-justify"></i> {{row.model.name}}',
        taskContent : '',
        allowSideResizing: false,
        labelsEnabled: true,
        currentDate: 'line',
        currentDateValue: new Date(2013, 9, 23, 11, 20, 0),
        draw: false,
        readOnly: false,
        groupDisplayMode: 'promote',
        filterTask: '',
        filterRow: '',
        dateFrames: {
          'weekend': {
            evaluator: function(date) {
              return date.isoWeekday() === 6 || date.isoWeekday() === 7;
            },
            targets: ['weekend']
          },
          '11-november': {
            evaluator: function(date) {
              return date.month() === 10 && date.date() === 11;
            },
            targets: ['holiday']
          }
        },
        timeFramesNonWorkingMode: 'visible',
        columnMagnet: '15 minutes',
        timeFramesMagnet: true,
        headers: ['month'],
        headersFormats: {
          month: 'MMM'
        },
        tooltips: {
          enabled: true,
          dateFormat: 'MM/DD/YYYY'
        },
        showSide: false
      };

      var ganttChartData = function (){
        var project_data = [];

        _.forEach($scope.activities, function(activity, key) {
          var project_name = {
            name: activity.projectName,
            id: 'activity-' + activity.projectId,
            color: '#FFFFFF'
          };
          var taskId = [];
          var task_data = [];
          var tempdata = [];
          _.forEach(activity.taskList, function(task) {
            taskId.push(task.projectTaskId);
            var task_data = {
              name: task.title,
              id: task.projectTaskId,
              color: key % 2 === 0 ? '#5A9BCE':'#85CAE7',
              from: new Date(task.startDate),
              to: new Date(task.endDate),
              //progress: task.percentageComplete
            };
            tempdata.push(task_data);
          });
          project_name.tasks = tempdata;
          project_data.push(project_name);
        });
        $scope.ganttData = project_data;
        console.log(JSON.stringify($scope.ganttData));
      };

      //var currentProjectId = $rootScope.currentProjectInfo.projectId;
      $scope.model = {
        userId: userContext.authentication().userData.userId
      };

      $scope.projects = [];

      $scope.getCurrentProjectActivities = function() {
        var currentProject = _.where($scope.projects, {projectId: $rootScope.currentProjectInfo.projectId})[0];
        if(currentProject) {
          $scope.activities = currentProject.projects;
        }
      };

      $scope.getUserProject = function() {
        canceler = $q.defer();
        $scope.isLoadingGanttChart = true;
        projectFactory.getProjectByUser($scope.model, canceler).then(
          function(resp) {
            $scope.projects = resp.data.mainProject.projects;

            $scope.getCurrentProjectActivities();
            ganttChartData();
            $scope.isLoadingGanttChart = false;
          },
          function() {
            $scope.isLoadingGanttChart = false;
          }
        );
      };

      $scope.getUserProject();

      $scope.$on('$destroy', function(){
        if(canceler) {
          canceler.resolve();
        }
      });

      notifications.onCurrentProjectChange($scope, function(agrs){
        $scope.getUserProject();
      });

      notifications.onTaskCreated($scope, function() {
        $scope.getUserProject();
      });

      notifications.onTaskUpdated($scope, function(obj) {
        $scope.getUserProject();
      });

      notifications.onTaskDeleted($scope, function() {
        $scope.getUserProject();
      });

      notifications.onActivityCreated($scope, function() {
        $scope.getUserProject();
      });

      notifications.onActivityEdited($scope, function() {
        $scope.getUserProject();
      });

      notifications.onActivityDeleted($scope, function() {
        $scope.getUserProject();
      });
      
    }];
  return controller;
});
