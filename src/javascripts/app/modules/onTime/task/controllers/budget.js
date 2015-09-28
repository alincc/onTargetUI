/**
 * Created by tho on 8/23/15.
 */

define(function(require) {
  'use strict';
  var angular = require('angular'),
    lodash = require('lodash');

  var controller = ['$scope', '$rootScope', 'countryFactory', 'projectFactory', 'userContext', 'projectContext', 'activityFactory', 'toaster', 'taskFactory', 'notifications', '$filter', 'permissionFactory',
    function($scope, $rootScope, countryFactory, projectFactory, userContext, projectContext, activityFactory, toaster, taskFactory, notifications, $filter, permissionFactory) {
      $scope.task = {};
      $scope.isLoading = false;
      $scope.isSubmitting = false;
      $scope.model = {
        user: {
          userId: userContext.authentication().userData.userId
        },
        taskBudgetEstimates: []
      };
      $scope.isEdit = false;
      if(permissionFactory.checkFeaturePermission('ADD_TASK_BUDGET') || permissionFactory.checkFeaturePermission('EDIT_TASK_BUDGET')) {
        $scope.isEdit = true;
      }

      function daydiff(first, second) {
        return (second - first) / (1000 * 60 * 60 * 24);
      }

      $scope.getTaskBudget = function() {
        $scope.isLoading = true;
        taskFactory.getTaskBudget($rootScope.currentTask.projectTaskId).then(function(resp) {
          //console.log(resp);
          $scope.task = resp.data.task;
          _.forEach($scope.task.costsByMonthYear, function(n) {
              var y = n.taskInterval.year, m = n.taskInterval.month;
              var firstDate = $filter('date')(new Date(y, m - 1, 1), 'yyyy-MM-dd');
              var lastDate = $filter('date')(new Date(y, m, 0), 'yyyy-MM-dd');
              var fromDate = daydiff(firstDate, new Date($scope.task.startDate)) > 0 ? $scope.task.startDate : firstDate,
                toDate = daydiff(new Date($scope.task.endDate), lastDate) ? $scope.task.endDate : lastDate;
              if(_.findIndex(n.costs, { 'costType': 'ACTUAL'}) < 0) {
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
              if(_.findIndex(n.costs, { 'costType': 'PLANNED'}) < 0) {
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
          //console.log($scope.task.costsByMonthYear);
          $scope.isLoading = false;
        }, function() {
          $scope.isLoading = false;
        });
      };

      $scope.getTaskBudget();

      notifications.onBudgetUpdated($scope, function(args) {
        $scope.getTaskBudget();
      });
    }];
  return controller;
});