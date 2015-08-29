/**
 * Created by thophan on 8/27/2015.
 */
define(function(require) {
  'use strict';
  var angular = require('angular'),
    lodash = require('lodash');
  var controller = ['$scope', '$rootScope', 'projectFactory', 'userContext', '$q',
    function($scope, $rootScope, projectFactory, userContext, $q) {

    $scope.activities = [];
    $scope.isLoadingGanttChart = false;
    var canceler;

    var load = function() {
      var project_data = [];

      _.forEach($scope.activities, function(activity) {
        var project_name = {
          name: activity.projectName,
          id: 'activity-' + activity.projectId
        };
        var taskId = [];
        var task_data = [];
        var tempdata = [];
        _.forEach(activity.taskList, function(task) {
          taskId.push(task.projectTaskId);
          var task_data = {
            name: task.title, id: task.projectTaskId, tasks: [
              {
                name: task.title,
                color: '#F1C232',
                from: new Date(task.startDate),
                to: new Date(task.endDate),
                progress: task.percentageComplete
              }
            ]
          };
          tempdata.push(task_data);
        });
        project_name.children = taskId;
        project_data.push(project_name);
        project_data = project_data.concat(tempdata);
      });
      $scope.data = project_data;
      console.log($scope.data);
    };

    var currentProjectId = $rootScope.currentProjectInfo.projectId;
    $scope.model = {
      userId: userContext.authentication().userData.userId
    };

    $scope.projects = [];

    $scope.getCurrentProjectActivities = function() {
      var currentProject = _.where($scope.projects, {projectId: currentProjectId})[0];
      if(currentProject) {
        $scope.activities = currentProject.projects;
      }
    };

    $scope.getUserProject = function() {
      canceler = $q.defer();
      $scope.isLoadingGanttChart = true;
      projectFactory.getUserProject($scope.model, canceler).then(
        function(resp) {
          $scope.projects = resp.data.mainProject.projects;

          $scope.getCurrentProjectActivities();
          load();
          $scope.isLoadingGanttChart = false;
        },
        function() {
          $scope.isLoadingGanttChart = false;
        }
      );
    };

    /*$scope.loadActivity = function() {
      $scope.isLoadingGanttChart = true;
      activityFactory.getActivityOfProject(currentProjectId)
        .success(function(resp) {
          $scope.activities = resp.projects;
          load();
          $scope.isLoadingGanttChart = false;
        })
        .error(function(err) {
          $scope.isLoadingGanttChart = false;
        });
    };*/

    $scope.getUserProject();


    $scope.$on('$destroy', function(){
      if(canceler) {
        canceler.resolve();
      }
    });
  }];
  return controller;
});
