define(function(require) {
  'use strict';
  var angular = require('angular'),
    tpl = require('text!./templates/taskProgress.html'),
    _ = require('lodash'),
    module;
  module = angular.module('common.directives.taskProgress', []);

  module.run([
    '$templateCache',
    function($templateCache) {
      $templateCache.put('taskProgress/templates/taskProgress.html', tpl);
    }]);

  module.directive('taskProgress', [function() {
    return {
      restrict: 'E',
      scope: {
        task: '=task'
      },
      templateUrl: 'taskProgress/templates/taskProgress.html',
      controller: [
        '$scope',
        '$rootScope',
        'permissionFactory',
        'taskFactory',
        'notifications',
        function($scope,
                 $rootScope,
                 permissionFactory,
                 taskFactory,
                 notifications) {
          $scope.model = {
            percentageComplete: '',
            percentageType: "PERCENTAGE",
            taskId: $scope.task.projectTaskId,
            taskProgressLogId: ''
          };

          $scope.model.percentageComplete = $scope.task.percentageComplete;

          $scope.updateProgress = function() {
            if(!$scope.isEdit) {
              return;
            }
            taskFactory.createTaskPercentage({
              taskProgressList: $scope.model
            }).then(function(resp) {
              $scope.task.percentageComplete = $scope.model.percentageComplete;
              // Update task in list
              notifications.taskUpdated({
                projectTaskId: $rootScope.currentTask.projectTaskId,
                clear: false,
                task: {
                  percentageComplete: $scope.model.percentageComplete
                }
              });

              if(parseInt($scope.model.percentageComplete) === 100){
                $scope.task.status = '3';
              }else{
                $scope.task.status = '1';
              }
            });
          };

          $scope.isEdit = false;

          var checkPermission = function() {
            if(permissionFactory.checkFeaturePermission('ADD_TASK_PERCENTAGE') || permissionFactory.checkFeaturePermission('EDIT_TASK_PERCENTAGE')) {
              $scope.isEdit = true;
            }
          };

          checkPermission();
        }],
      link: function() {

      }
    };
  }]);
  return module;
});