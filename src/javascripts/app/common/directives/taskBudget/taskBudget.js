define(function(require) {
  'use strict';
  var angular = require('angular'),
    tpl = require('text!./templates/taskBudget.html'),
    budgetEditorTpl = require('text!./templates/budgetEditor.html'),
    _ = require('lodash'),
    budgetEditorDirective = require('./budgetEditor'),
    module;
  module = angular.module('common.directives.taskBudget', []);

  module.run([
    '$templateCache',
    function($templateCache) {
      $templateCache.put('taskBudget/templates/taskBudget.html', tpl);
      $templateCache.put('budgetEditorTemplate', budgetEditorTpl);
    }]);
  module.directive('budgetEditor', budgetEditorDirective);
  module.directive('taskBudget', [function() {
    return {
      restrict: 'E',
      scope: {
        task: '=task'
      },
      templateUrl: 'taskBudget/templates/taskBudget.html',
      controller: [
        '$scope',
        '$rootScope',
        'permissionFactory',
        'taskFactory',
        '$filter',
        function($scope,
                 $rootScope,
                 permissionFactory,
                 taskFactory,
                 $filter) {
          $scope.isLoading = false;
          $scope.isSubmitting = false;
          $scope.model = {
            user: {
              userId: $rootScope.currentUserInfo.userId
            },
            taskBudgetEstimates: []
          };

          $scope.isEdit = permissionFactory.checkFeaturePermission('ADD_TASK_BUDGET') || permissionFactory.checkFeaturePermission('EDIT_TASK_BUDGET');

          function daydiff(first, second) {
            return (second - first) / (1000 * 60 * 60 * 24);
          }

          $scope.getTaskBudget = function() {
            $scope.isLoading = true;
            taskFactory.getTaskBudget($scope.task.projectTaskId)
              .then(function(resp) {
              //console.log(resp);
              $scope.task = resp.data.task;
              _.forEach($scope.task.costsByMonthYear, function(n) {
                var y = n.taskInterval.year, m = n.taskInterval.month;
                var firstDate = $filter('date')(new Date(y, m - 1, 1), 'yyyy-MM-dd');
                var lastDate = $filter('date')(new Date(y, m, 0), 'yyyy-MM-dd');
                var fromDate = daydiff(firstDate, new Date($scope.task.startDate)) > 0 ? $scope.task.startDate : firstDate,
                  toDate = daydiff(new Date($scope.task.endDate), lastDate) ? $scope.task.endDate : lastDate;
                if(_.findIndex(n.costs, {'costType': 'ACTUAL'}) < 0) {
                  var cost1 = {
                    cost: 0,
                    costType: "ACTUAL",
                    fromDate: fromDate,
                    toDate: toDate,
                    id: null,
                    month: m,
                    year: y
                  };
                  n.costs.push(cost1);
                }
                if(_.findIndex(n.costs, {'costType': 'PLANNED'}) < 0) {
                  var cost2 = {
                    cost: 0,
                    costType: "PLANNED",
                    fromDate: fromDate,
                    toDate: toDate,
                    id: null,
                    month: m,
                    year: y
                  };

                  n.costs.push(cost2);
                }
              });
              $scope.isLoading = false;
            }, function() {
              $scope.isLoading = false;
            });
          };

          $scope.getTaskBudget();
        }],
      link: function() {

      }
    };
  }]);
  return module;
});