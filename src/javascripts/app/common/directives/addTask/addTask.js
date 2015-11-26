define(function(require) {
  'use strict';
  var angular = require('angular'),
    tpl = require('text!./templates/addTask.html'),
    _ = require('lodash'),
    angularUiSelect = require('angularUiSelect'),
    angularMessages = require('angularMessages'),
    taskServiceModule = require('app/common/services/task'),
    module;
  module = angular.module('common.directives.addTask', [
    'ui.select',
    'ngMessages',
    'common.services.task'
  ]);

  module.run([
    '$templateCache',
    function($templateCache) {
      $templateCache.put('addTask/templates/addTask.html', tpl);
    }]);

  module.directive('addTask', [function() {
    return {
      restrict: 'E',
      scope: {
        task: '=task',
        edit: '@'
      },
      templateUrl: 'addTask/templates/addTask.html',
      controller: [
        '$scope',
        '$rootScope',
        'taskFactory',
        '$filter',
        function($scope,
                 $rootScope,
                 taskFactory,
                 $filter) {
          $scope.editTask = $scope.edit === "true";
          $scope.taskStatuses = taskFactory.getTaskStatuses();
          $scope.taskSeverities = taskFactory.getTaskSeverities();
          $scope.minDate2 = $rootScope.activitySelected.startDate;
          $scope.maxDate2 = $rootScope.activitySelected.endDate;
          $scope.initStartDate = new Date($scope.minDate2);
          $scope.contacts = $rootScope.contactList || [];
          $scope.$watchCollection('[task.startDate, task.endDate]', function(e) {
            $scope.minDate = $scope.task.startDate ? $scope.task.startDate : $rootScope.activitySelected.startDate;
            $scope.maxDate = $scope.task.endDate ? $scope.task.endDate : $rootScope.activitySelected.endDate;
            $scope.initEndDate = new Date($scope.minDate);
            $scope.task.startDate = $filter('date')($scope.task.startDate, 'yyyy-MM-dd');
            $scope.task.endDate = $filter('date')($scope.task.endDate, 'yyyy-MM-dd');
          });

          $scope.startDate = {
            options: {
              formatYear: 'yyyy',
              startingDay: 1
            },
            isOpen: false,
            open: function($event) {
              this.isOpen = true;
            }
          };

          $scope.endDate = {
            options: {
              formatYear: 'yyyy',
              startingDay: 1
            },
            isOpen: false,
            open: function($event) {
              this.isOpen = true;
            }
          };
        }],
      link: function() {

      }
    };
  }]);
  return module;
});