/**
 * Created by aashiskhanal on 9/2/15.
 */
define(function (require){
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', '$q', 'onTargetFactory', '$modal', 'storage', '$stateParams', '$location', 'appConstant', '$filter', 'utilFactory', '$sce', '$window', 'projectFactory',
    function ($scope, $rootScope, $q, onTargetFactory, $modal, storage, $stateParams, $location, appConstant, $filter, utilFactory, $sce, $window, projectFactory){
      $scope.app = appConstant.app;
      $scope.isLoading = false;

      projectFactory.getBudgetMeterData($rootScope.currentProjectInfo.projectId, $rootScope.currentUserInfo.userId).
        then(function (content){

          $scope.TimeComplete = {
            colours: [
              '#B22222',
              '#efefef'
            ],
            options: {
              animationEasing: "linear",
              animationSteps: 10
            },
            data: [],
            labels: ['Time Complete', '']
          }; //SPI

          $scope.CostComplete = {
            colours: [
              '#c1d64c',
              '#efefef'
            ],
            options: {
              animationEasing: "linear",
              animationSteps: 10
            },
            data: [],
            labels: ['Cost Complete', '']
          }; //CPI

          $scope.CostVariance = {
            colours: [
              '#c1d64c',
              '#efefef'
            ],
            options: {
              animationEasing: "linear",
              animationSteps: 10
            },
            data: [],
            labels: ['Cost Variance', '']
          }; //CV

          $scope.scheduleVariance = {
            colours: [
              '#63b2db',
              '#efefef'
            ],
            options: {
              animationEasing: "linear",
              animationSteps: 10
            },
            data: [],
            labels: ['Schedule Variance', '']
          }; //SV

          /*================STARTING CALCULATION==============*/
          var earnedDataValue = content.data;

          var lineValues = earnedDataValue.earnedValueAnalysisReportMap;
          var today = new Date();
          var currentMonth = today.getMonth();
          var currentYear = today.getFullYear();

          var EV = [];
          var PV = [];
          var AC = [];

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

          /*
           * Cost Variance % = Cost Variance (CV)/ EV
           Schedule Variance % = Schedule Variance (SV)/Planned Value
           */


          if (lineValues !== null) {
            angular.forEach(lineValues, function (value, index){

              var earnedValue = [];
              var plannedValue = [];
              var actualCost = [];

              var dateToString = +new Date(value.year, value.month - 1);

              var thisMonth = value.month - 1;
              var apiYear = value.year;

              if (thisMonth === currentMonth && apiYear === currentYear) {
                //SPI = value.schedulePerformanceIndex * 100;
                SPI = value.schedulePerformanceIndex;
                SPI = SPI.toFixed(1);
                //CPI = value.costPerformanceIndex * 100;
                CPI = value.costPerformanceIndex;
                CPI = CPI.toFixed(1);

                //CV = (value.costVariance / value.cumulativeEarnedValue) * 100;
                CV = (value.costVariance / value.cumulativeEarnedValue);
                CV = CV.toFixed(1);

                //SV = (value.scheduleVariance / value.cumulativePlannedValue)*100;
                SV = (value.scheduleVariance / value.cumulativePlannedValue);
                SV = SV.toFixed(1);
                if (value.cumulativeEarnedValue === 0) {
                  CV = 0;
                }

                if (value.cumulativePlannedValue === 0) {
                  SV = 0;
                }

                cumulativePlannedValue = value.cumulativePlannedValue;
                totalActualCost = value.totalActualCost;
                estimatedCostAtCompletion = value.estimatedCostAtCompletion;
                estimateToComplete = estimatedCostAtCompletion - totalActualCost;

              }


            });
          }


          /*==================================================================================================*/

          //SPI
          //CV = 20; //TEST DATA
          CPI = 25;
          SPI = 60;
          CV = 30;
          SV = 2;
          $scope.TimeComplete.data[0] = SPI; //SPI
          $scope.TimeComplete.data[1] = 100 - SPI; //SPI
          $scope.CostComplete.data[0] = CPI; //CPI
          $scope.CostComplete.data[1] = 100 - CPI; //CPI
          $scope.CostVariance.data[0] = CV; //CV
          $scope.CostVariance.data[1] = 100 - CV; //CV
          $scope.scheduleVariance.data[0] = SV; //SV
          $scope.scheduleVariance.data[1] = SV; //SV

          $scope.SPI = SPI + " %";
          $scope.CPI = CPI + " %";
          $scope.CV = CV + " %";
          $scope.SV = SV + " %";

          /*=============================EOF PIE CHARTS =============================================================*/


        }, function (error){
          $scope.isLoading = false;
        });

      //cost performance index
      $scope.costPerformanceIndex = 100;
      $scope.schedulePerformanceIndex = 60;
      $scope.costVariance = 30;
      $scope.timeVariance = 55;

    }];
  return controller;
});


