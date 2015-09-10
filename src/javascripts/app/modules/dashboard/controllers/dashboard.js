define(function(require) {
  'use strict';
  var angular = require('angular'),
    lodash = require('lodash');
  var controller = ['$scope', '$rootScope', '$window', 'userContext', '$state', 'appConstant', 'projectFactory', 'accountFactory', 'utilFactory', 'documentFactory', 'activityFactory', '$timeout', 'notifications', 'taskFactory',
    function($scope, $rootScope, $window, userContext, $state, appConstant, projectFactory, accountFactory, utilFactory, documentFactory, activityFactory, $timeout, notifications, taskFactory) {
      $scope.app = appConstant.app;
      $scope.currentProject = $rootScope.currentProjectInfo;

      function daydiff(first, second) {
        return (second - first) / (1000 * 60 * 60 * 24);
      }

      function getCurrentDate() {
        var currentDate = new Date();
        return new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      }

      function load() {
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

            var earnedValueData = [];
            _.each(labels, function(el, idx) {
              earnedValueData.push([
                el,
                EV[idx]
              ]);
            });

            var actualValueData = [];
            _.each(labels, function(el, idx) {
              actualValueData.push([
                el,
                AC[idx]
              ]);
            });

            var plannedValueData = [];
            _.each(labels, function(el, idx) {
              plannedValueData.push([
                el,
                PV[idx]
              ]);
            });

            $scope.plot = {
              data: [
                {
                  data: earnedValueData, // [bottom, left]
                  label: 'Earned',
                  points: {show: true, radius: 4},
                  lines: {show: true, fill: false, fillColor: {colors: [{opacity: 0.1}, {opacity: 0.1}]}}
                },
                {
                  data: actualValueData, // [bottom, left]
                  label: 'Actual',
                  points: {show: true, radius: 4},
                  lines: {show: true, fill: false, fillColor: {colors: [{opacity: 0.1}, {opacity: 0.1}]}}
                },
                {
                  data: plannedValueData, // [bottom, left]
                  label: 'Planned',
                  points: {show: true, radius: 4},
                  lines: {show: true, fill: false, fillColor: {colors: [{opacity: 0.1}, {opacity: 0.1}]}}
                }
              ],
              options: {
                colors: appConstant.app.projectHealthColours,
                series: {shadowSize: 2},
                xaxis: {font: {color: '#ccc'}, mode: "categories", tickLength: 0},
                yaxis: {font: {color: '#ccc'}},
                grid: {hoverable: true, clickable: true, borderWidth: 0, color: '#ccc'},
                tooltip: true,
                tooltipOpts: {content: '%y', defaultTheme: false, shifts: {x: 10, y: -20}},
                legend: {
                  show: true,
                  noColumns: 3,
                  labelFormatter: function(label, series) {
                    return '<span style="color:'+series.color+';">' + label + '</span>';
                  }
                }
              }
            };

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
        $scope.weatherError = false;
        $scope.isLoadingWeather = true;
        utilFactory.getWeather($scope.currentProject.projectAddress.zip)
          .success(function(resp) {
            if(angular.isDefined(resp.cod) && angular.isDefined(resp.message)) {
              $scope.weatherError = true;
            } else {
              $scope.weather.temp = resp.main.temp;
              $scope.weather.humidity = resp.main.humidity;
              $scope.weather.windSpeed = resp.wind.speed;
              $scope.weather.name = resp.name;
              $scope.weather.desc = resp.weather[0].description;
              $scope.weather.icon = resp.weather[0].icon;
            }
          });

        // Tasks
        $scope.tasks = {
          pastDue: [],
          active: [],
          completed: [],
          dueIn7Day: [],
          critical: []
        };

        var currentDate = new Date();
        var now = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        $scope.loadTask = function() {
          taskFactory.getProjectTasks($scope.currentProject.projectId)
            .success(function(resp) {
              if(resp.tasks.length > 0) {
                _.each(resp.tasks, function(tsk) {
                  //$scope.tasks.scheduled.push(tsk);

                  var tskEndDate = new Date(tsk.endDate);
                  var diffDays = daydiff(now, tskEndDate);

                  if('3' === tsk.status) { // Completed
                    $scope.tasks.completed.push(tsk);
                  }
                  else if('1' === tsk.status || '2' === tsk.status) {
                    if('1' === tsk.status) { // Active
                      $scope.tasks.active.push(tsk);
                    }
                    if(diffDays <= 0) {
                      $scope.tasks.pastDue.push(tsk);
                    }
                    else if(diffDays <= 7) {
                      $scope.tasks.dueIn7Day.push(tsk);
                    }
                  }

                  if('CRITICAL' === tsk.severity) {
                    $scope.tasks.critical.push(tsk);
                  }
                });
              }

            })
            .error(function(err) {

            });
        };

        $scope.loadTask();

        $scope.taskTabSelect = function() {
          $timeout(function() {
            $scope.$broadcast('content.reload');
          }, 200);
        };

        // Task status
        $scope.tasksStatus = [];
        $scope.taskStatusCount = 0;
        $scope.isTasksStatusLoading = true;
        projectFactory.getTaskCount($scope.currentProject.projectId).then(
          function(resp) {
            $scope.tasksStatus = resp.data.taskCountByStatus;
            for(var i = 0; i < $scope.tasksStatus.length; i++) {
              $scope.taskStatusCount = $scope.taskStatusCount + $scope.tasksStatus[i].taskCount;
            }
            $scope.taskStatusCount = $scope.taskStatusCount > 0 ? $scope.taskStatusCount : 1;
            $scope.isTasksStatusLoading = false;
          }, function(err) {
            $scope.isTasksStatusLoading = false;
          }
        );

        // Document Submittal
        $scope.submittalStatus = {
          colours: [
            '#c1d64c',
            '#63b2db'
          ],
          options: {
            animationEasing: "linear",
            animationSteps: 10
          },
          data: [],
          labels: ['Approval', 'Submittal']
        };
        $scope.isSubmittalStatusLoading = true;
        documentFactory.getUserDocument($scope.currentProject.projectId).then(
          function(resp) {
            $scope.submittalStatus.data[0] = resp.data.totalApprovals;
            $scope.submittalStatus.data[1] = resp.data.totalSubmits;
            //$scope.submittalStatus.all = resp.data.totalApprovals + resp.data.totalSubmits;
            $scope.isSubmittalStatusLoading = false;
          }, function(err) {
            $scope.isSubmittalStatusLoading = false;
          }
        );

        // Activity
        $scope.activityLogs = [];
        $scope.isActivityLogLoading = true;

        projectFactory.getActivityLog({
          "projectId": $scope.currentProject.projectId,
          "pageNumber": 1,
          "perPageLimit": 10
        }).then(
          function(resp) {
            $scope.activityLogs = resp.data.logs;
            $scope.isActivityLogLoading = false;
          }, function(err) {
            $scope.isActivityLogLoading = false;
          }
        );
      }

      load();

      // Events
      notifications.onCurrentProjectChange($scope, function(agrs) {
        $scope.currentProject = $rootScope.currentProjectInfo;
        load();
      });

      //timeline height
      $scope.$on("$stateChangeSuccess", function(event, current, previous) {

        $timeout(function() {
          var height = document.getElementById('task-container').offsetHeight;

          document.getElementById('time-line').setAttribute("style","height:" + (height - 52)  + "px");
        });
      });
    }];
  return controller;
});
