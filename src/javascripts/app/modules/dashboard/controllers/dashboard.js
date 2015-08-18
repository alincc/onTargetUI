define(function(require) {
  'use strict';
  var angular = require('angular'),
    lodash = require('lodash');
  var controller = ['$scope', '$rootScope', 'userContext', '$state', 'appConstant', 'projectFactory', 'accountFactory', 'utilFactory', '$timeout', function($scope, $rootScope, userContext, $state, appConstant, projectFactory, accountFactory, utilFactory, $timeout) {
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
          animation: false,
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

    // Dashboard BI
    $scope.isLoadingDashboardBi = true;
    $scope.dashboardBi = {
      timeSaved: null,
      treesSaved: null,
      noAccident: null
    };
    projectFactory.getDashboardBi($scope.currentProject.projectId)
      .success(function(resp) {
        $scope.dashboardBi.treesSaved = resp.treesSaved;
        $scope.dashboardBi.timeSaved = resp.timeSaved;
        $scope.dashboardBi.noAccident = resp.noAccidentReport;
        $scope.isLoadingDashboardBi = false;
      });

    // Safety
    $scope.isLoadingSafetyInfo = true;
    $scope.safetyInfo = '';
    accountFactory.getSafety()
      .success(function(resp) {
        $scope.safetyInfo = resp.safetyInfo;
      });

    function daydiff(first, second) {
      return (second - first) / (1000 * 60 * 60 * 24);
    }

    function getCurrentDate() {
      var currentDate = new Date();
      return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
    }

    $scope.projectDate = {
      total: daydiff(new Date($scope.currentProject.startDate), new Date($scope.currentProject.endDate)),
      spent: Math.floor(daydiff(new Date($scope.currentProject.startDate), getCurrentDate())),
      remain: Math.ceil(daydiff(getCurrentDate(), new Date($scope.currentProject.endDate)))
    };

    // Weather
    $scope.weather = {
      temp: 0,
      humidity: 0,
      windSpeed: 0,
      name: '',
      desc: '',
      icon: ''
    };
    $scope.getWeatherIcon = function() {
      switch($scope.weather.icon) {
        case "01d":
          return "wi-day-sunny";
        case "01n":
          return "wi-night-clear";
        case "02d":
          return "wi-day-cloudy";
        case "02n":
          return "wi-night-cloudy";
        case "03d":
        case "03n":
          return "wi-cloudy";
        case "04d":
        case "04n":
          return "wi-hail";
        case "09d":
          return "wi-day-showers";
        case "09n":
          return "wi-night-alt-showers";
        case "10d":
          return "wi-day-rain";
        case "10n":
          return "wi-night-alt-rain";
        case "11d":
          return "wi-day-lightning";
        case "11n":
          return "wi-night-alt-lightning";
        case "13d":
          return "wi-day-snow";
        case "13n":
          return "wi-night-alt-snow";
        case "50d":
        case "50n":
          return "wi-smog";
        default:
          return "";
      }
    };
    $scope.isLoadingWeather = true;
    utilFactory.getWeather($scope.currentProject.projectAddress.zip)
      .success(function(resp) {
        $scope.weather.temp = resp.main.temp;
        $scope.weather.humidity = resp.main.humidity;
        $scope.weather.windSpeed = resp.wind.speed;
        $scope.weather.name = resp.name;
        $scope.weather.desc = resp.weather[0].description;
        $scope.weather.icon = resp.weather[0].icon;
      });

    // Tasks
    $scope.tasks = {
      pastDue: [1, 2, 3, 4, 5, 6, 7, 8],
      active: [],
      completed: [],
      dueIn7Day: [],
      scheduled: [],
      critical: []
    };

    // fix scroll
    $timeout(function() {
      $scope.$broadcast('content.reload');
    }, 1000);

    //_.each($scope.currentProject.projects, function(el) {
    //  _.each(el.taskList, function(t) {
    //    if(getCurrentDate() > new Date(t.endDate)) {
    //      // Past due
    //      $scope.tasks.pastDue.push(t);
    //    }
    //
    //    // Active status
    //    if(t.status === "1") {
    //      $scope.tasks.active.push(t);
    //    }
    //    // Pending status
    //    else if(t.status === "2") {
    //      //$scope.tasks.active.push(t);
    //    }
    //    // Completed status
    //    else if(t.status === "3") {
    //      $scope.tasks.active.push(t);
    //    }
    //    // Expired status
    //    else if(t.status === "4") {
    //      $scope.tasks.active.push(t);
    //    }
    //  });
    //});
  }];
  return controller;
});
