define(function(require) {
  'use strict';
  var angular = require('angular'),
    lodash = require('lodash');
  var controller = ['$scope', '$rootScope', 'userContext', '$state', 'appConstant', 'projectFactory', function($scope, $rootScope, userContext, $state, appConstant, projectFactory) {
    $scope.app = appConstant.app;
    $scope.currentProject = $rootScope.currentProjectInfo;
    console.log($scope.currentProject);

    // Project health
    $scope.isLoadingProjectHealth = true;
    projectFactory.getBudgetMeterData($scope.currentProject.projectId)
      .success(function(resp) {
        var lineValues = resp.earnedValueAnalysisReportMap;
        var today = new Date();
        var currentMonth = today.getMonth();
        var EV = [];
        var PV = [];
        var AC = [];
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        var labels = [];

        var SPI = "";
        var CPI = "";
        var CV = "";
        var SV = "";

        var cumulativePlannedValue = "";
        var originalContingency = "";
        var originalContingencyAmount = "";
        var totalActualCost = "";
        var estimatedCostAtCompletion = "";
        var estimateToComplete = "";

        if(lineValues !== null) {
          _.forEach(lineValues, function(value, index) {
            var dateToString = new Date(value.year, value.month - 1);

            var thisMonth = value.month - 1;

            if(thisMonth === currentMonth) {
              SPI = value.schedulePerformanceIndex * 100;
              CPI = value.schedulePerformanceIndex * 100;
              CV = (value.costVariance / value.cumulativeEarnedValue);
              CV = CV.toFixed(2);
              SV = value.scheduleVariance / value.cumulativePlannedValue;

              cumulativePlannedValue = value.cumulativePlannedValue;
              totalActualCost = value.totalActualCost;
              estimatedCostAtCompletion = value.estimatedCostAtCompletion;
              estimateToComplete = estimatedCostAtCompletion - totalActualCost;
            }

            EV.push(value.cumulativeEarnedValue);
            PV.push(value.cumulativePlannedValue);
            AC.push(value.cumulativeActualCost);

            var d = new Date(value.year, value.month, 1);
            labels.push(monthNames[d.getMonth() === 0 ? 11 : d.getMonth() - 1]);
          });
        }

        $scope.options = {
          legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li style=\"color:<%=datasets[i].strokeColor%>\"><span style=\"border-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>",
          //scaleOverride: true,
          //scaleStepWidth: 1,
          //scaleStartValue: 0,
          //scaleSteps: 6
        };
        $scope.series = ['Planned', 'Earned', 'Actual']; // legend
        $scope.data = [PV, EV, AC]; // vertical line
        $scope.labels = labels; // horizontal line

        $scope.isLoadingProjectHealth = false;
      })
      .error(function() {
        $scope.isLoadingProjectHealth = false;
      });
  }];
  return controller;
});
