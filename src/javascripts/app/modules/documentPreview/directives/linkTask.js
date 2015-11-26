define(function(require) {
  'use strict';
  var angular = require('angular'),
    _ = require('lodash');
  var directive = [function() {
    return {
      restrict: 'E',
      scope: {},
      controller: [
        '$scope',
        '$rootScope',
        '$q',
        'activityFactory',
        function($scope,
                 $rootScope,
                 $q,
                 activityFactory) {
          var canceler;
          $scope.isLoadingActivity = false;
          $scope.currentProject = $rootScope.currentProjectInfo;
          $scope.activities = [];
          $scope.isCreateTask = false;
          $scope.loadActivity = function(cb) {
            if(canceler) {
              canceler.resolve();
            }
            canceler = $q.defer();
            $scope.isLoadingActivity = true;
            activityFactory.getActivityOfProject($scope.currentProject.projectId, canceler)
              .success(function(resp) {
                $scope.activities = resp.projects;
                $scope.isLoadingActivity = false;
                if(cb) {
                  cb();
                }
              })
              .error(function(err) {
                $scope.isLoadingActivity = false;
              });
          };
          $scope.mapData = function() {
            _.map($scope.activities, function(el) {
              var newEl = el;
              newEl.activeTasks = _.where(el.taskList, {status: "1"}).length;
              newEl.pendingTasks = _.where(el.taskList, {status: "2"}).length;
              return newEl;
            });
          };
          $scope.selectActivity = function(activity) {
            $scope.activitySelected = $rootScope.activitySelected = activity;
          };
          $scope.createTask = function() {
            $scope.newTask = {
              projectTaskId: null,
              title: "",
              description: "",
              status: "",
              severity: "",
              startDate: "",
              endDate: "",
              projectId: 0,
              selectedAssignees: []
            };
            $scope.isCreateTask = true;
          };
          $scope.backToSelectActivity = function() {
            $scope.activitySelected = $rootScope.activitySelected = null;
          };
          $scope.backToSelectTask = function(){
            $scope.isCreateTask = false;
          };
          $scope.loadActivity();
          // remap data, add task active and pending counter
          $scope.mapData();
        }],
      templateUrl: 'documentPreview/templates/linkTask.html',
      link: function(scope, elem, attrs) {

      }
    };
  }];
  return directive;
});