define(function(require){
  'use strict';
  var angular = require('angular');
  var directive = ['$timeout', function($timeout){
    return {
      restrict: 'E',
      scope: {
        task: '=task',
        budget: '=model',
        type: '@',
        interval: '=interval'
      },
      templateUrl: 'budgetEditorTemplate',
      replace: true,
      controller: ['$scope', '$rootScope', 'taskFactory', function($scope, $rootScope, taskFactory){

        function updateBudget(){
          taskFactory.updateTaskBudget($scope.model.taskBudgetEstimates).then(function(resp){
            $scope.model.taskBudgetEstimates = [];
            $scope.budgetBak = angular.copy($scope.budget);
            $scope.budgetEditor.isUpdating = false;
            $scope.cancel();
          }, function(){
            $scope.budgetEditor.isUpdating = false;
            $scope.cancel();
          });
        }


        $scope.budgetEditor = {
          isEdit: false,
          isUpdating: false
        };

        $scope.budgetBak = angular.copy($scope.budget);

        $scope.model = {
          taskBudgetEstimates: []
        };

        $scope.edit = function(){
          if($scope.budgetEditor.isUpdating) {
            return;
          }
          $scope.budgetEditor.isEdit = true;
        };

        $scope.cancel = function(){
          $scope.budgetEditor.isEdit = false;
        };

        $scope.update = function(model){
          console.log($scope.budget_editor_frm.$valid, model);
          if($scope.budget_editor_frm.$valid) {
            if((!model || model.cost === null) && $scope.budget) {
              $scope.budget.cost = angular.copy($scope.budgetBak.cost);
            }
            else if(model && $scope.budgetBak && $scope.budgetBak.cost !== model.cost) {
              $scope.budgetEditor.isUpdating = true;
              model.taskId = $rootScope.currentTask.projectTaskId;
              $scope.model.taskBudgetEstimates.push(model);
              updateBudget();
            }
            else if(!$scope.budgetBak && model) { // undefined
              $scope.budgetEditor.isUpdating = true;
              $scope.model.taskBudgetEstimates.push({
                "cost": model.cost,
                "costType": $scope.type,
                "createdBy": $rootScope.currentUserInfo.userId,
                "fromDate": $rootScope.currentTask.startDate,
                "id": null,
                "month": $scope.interval.month,
                "toDate": $rootScope.currentTask.endDate,
                "year": $scope.interval.year,
                "taskId": $rootScope.currentTask.projectTaskId
              });

              updateBudget();
            }
          }
          else {
            if($scope.budget && $scope.budgetBak) {
              $scope.budget.cost = angular.copy($scope.budgetBak.cost);
            }
          }
          $scope.cancel();
        };
      }],
      link: function(scope, elem, attrs){
        var budgetText = elem[0].querySelector('.budget-text');
        var budgetInput = elem[0].querySelector('.budget-input');

        elem.on('click', function(){
          scope.$apply(function(){
            scope.edit();
            $timeout(function(){
              budgetInput.focus();
            }, 50);
          });
        });

        scope.$on('$destroy', function(){
          elem.on('click');
        });
      }
    };
  }];
  return directive;
});