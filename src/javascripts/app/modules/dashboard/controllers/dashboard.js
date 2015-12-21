define(function(require) {
  'use strict';
  var angular = require('angular'),
    lodash = require('lodash'),
    moment = require('moment');
  var controller = ['$scope', '$rootScope', '$window', 'userContext', '$state', 'appConstant', 'projectFactory', 'accountFactory', 'utilFactory', 'documentFactory', 'activityFactory', '$timeout', 'notifications', 'taskFactory',
    function($scope, $rootScope, $window, userContext, $state, appConstant, projectFactory, accountFactory, utilFactory, documentFactory, activityFactory, $timeout, notifications, taskFactory) {
      $scope.app = appConstant.app;
      $scope.project = $scope.currentProject = $rootScope.currentProjectInfo;

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
        projectFactory.getBudgetMeterData($scope.project.projectId)
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
            var earnedValueData = [];
            var actualValueData = [];
            var plannedValueData = [];
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

                // Labels
                var d = new Date(value.year, value.month, 1);
                var lbName = monthNames[d.getMonth() === 0 ? 11 : d.getMonth() - 1] + ' ' + value.year;
                labels.push(lbName);
                // Earned values
                if(moment().diff(moment([value.year, value.month]), 'months') >= 0) {
                  earnedValueData.push([
                    lbName,
                    value.cumulativeEarnedValue
                  ]);
                }

                // Actual values
                if(moment().diff(moment([value.year, value.month]), 'months') >= 0) {
                  actualValueData.push([
                    lbName,
                    value.cumulativeActualCost
                  ]);
                }

                // Planned values
                plannedValueData.push([
                  lbName,
                  value.cumulativePlannedValue
                ]);
              });
            }

            $scope.plot = {
              data: [
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
                    return '<span style="color:' + series.color + ';">' + label + '</span>';
                  },
                  container: angular.element(document.querySelector('#legend-container'))
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
        projectFactory.getDashboardBi($scope.project.projectId)
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
          total: daydiff(new Date($scope.project.startDate), new Date($scope.project.endDate)),
          spent: Math.floor(daydiff(new Date($scope.project.startDate), getCurrentDate())),
          remain: Math.ceil(daydiff(getCurrentDate(), new Date($scope.project.endDate)))
        };
        // Weather
        $scope.weathers = [];

        $scope.getWeatherIcon = function(icon) {
          switch(icon) {
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

        $scope.getWeatherIconById = function(id) {
          return "wi-owm-" + id;
        };

        $scope.weatherError = false;
        $scope.isLoadingWeather = true;
		$scope.weather = {};
        utilFactory.getWeather($scope.project.projectAddress.zip)
          .success(function(resp) {
            var objectGroupBy = _.groupBy(resp.list, function(value) {
              return value.dt_txt.split(" ")[0];
            });

            var index = 0, value, weather;
            angular.forEach(objectGroupBy, function(data) {
              if(index === 0) {
                value = _.findLast(data, function(n) {
                  var weatherDate = new Date(n.dt_txt);

                  var isoDate = new Date().toISOString();
                  var utcDateTime = new Date(isoDate);

                  return weatherDate < utcDateTime;
                });

                weather = {
                  humidity: value.main.humidity + '%',
                  windSpeed: value.wind.speed + 'MPM NW',
                  temp: value.main.temp + ' F',
                  iconId: value.weather[0].id,
                  icon: value.weather[0].icon,
                  dt_txt: value.dt_txt.split(" ")[0]
                };

                $scope.weathers.push(weather);
              } else if(index < 5) {
                value = _.first(data);

                weather = {
                  humidity: value.main.humidity + '%',
                  windSpeed: value.wind.speed + 'MPM NW',
                  temp: value.main.temp + ' F',
                  iconId: value.weather[0].id,
                  icon: value.weather[0].icon,
                  dt_txt: value.dt_txt.split(" ")[0]
                };

                $scope.weathers.push(weather);
              }

              index++;
            });

            if(angular.isDefined(resp.cod) && angular.isDefined(resp.message)) {
              $scope.weatherError = true;
            } else {
              $scope.weather.temp = resp.main.temp;
              $scope.weather.humidity = resp.main.humidity;
              $scope.weather.windSpeed = resp.wind.speed;
              $scope.weather.name = resp.name;
              $scope.weather.desc = resp.weather[0].description;
              $scope.weather.icon = resp.weather[0].icon;
              $scope.weather.id = resp.weather[0].id;
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
          $scope.taskLoading = true;
          taskFactory.getProjectTasks($scope.project.projectId)
            .success(function(resp) {
              console.log(resp);
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
                $scope.taskLoading = false;
              }

            })
            .error(function(err) {
              $scope.taskLoading = false;
            });
        };

        $scope.loadTask();

        $scope.taskTabSelect = function() {
          $timeout(function() {
            $scope.$broadcast('content.reload');
          }, 200);
        };

        $scope.selectTask = function(task) {
          $state.transitionTo('app.onTime', {activityId: task.activityId, taskId: task.projectTaskId});
        };

        // Task status
        $scope.tasksStatus = [];
        $scope.taskStatusCount = 0;
        $scope.isTasksStatusLoading = true;
        projectFactory.getTaskCount($scope.project.projectId).then(
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

        //// Document Submittal
        //$scope.submittalStatus = {
        //  colours: [
        //    '#c1d64c',
        //    '#63b2db'
        //  ],
        //  options: {
        //    animationEasing: "linear",
        //    animationSteps: 10
        //  },
        //  data: [],
        //  labels: ['Approval', 'Submittal']
        //};
        //$scope.isSubmittalStatusLoading = true;
        //documentFactory.getUserDocument($scope.project.projectId).then(
        //  function(resp) {
        //
        //    $scope.submittalStatus.data[0] = resp.data.totalApprovals;
        //    $scope.submittalStatus.data[1] = resp.data.totalSubmits;
        //    //$scope.submittalStatus.all = resp.data.totalApprovals + resp.data.totalSubmits;
        //    $scope.isSubmittalStatusLoading = false;
        //    console.log($scope.submittalStatus);
        //  }, function(err) {
        //    $scope.isSubmittalStatusLoading = false;
        //  }
        //);

        // Activity
        $scope.activityLogs = [];
        $scope.isActivityLogLoading = true;

        projectFactory.getActivityLog({
          "projectId": $scope.project.projectId,
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
        $scope.project = $rootScope.currentProjectInfo;
        load();
      });

      ////timeline height
      //$scope.$on("$stateChangeSuccess", function(event, current, previous) {
      //
      //  $timeout(function() {
      //    var height = document.getElementById('task-container').offsetHeight;
      //
      //    document.getElementById('time-line').setAttribute("style", "height:" + (height - 52) + "px");
      //  },1000);
      //});

      $scope.documentStatuses = [];
      documentFactory.getDocumentStatus().then(function(resp) {
        var setData = function(data, key) {
          switch(key) {
            case 'submittedCount':
              documentStatus.data[0] = data;
              break;
            case 'approvedCount':
              documentStatus.data[1] = data;
              break;
            case 'rejectedCount':
              documentStatus.data[2] = data;
              break;
          }
        };

        for(var i = 0; i < 4; i++) {
          var key = '';
          
          switch(i) {
            case 0:
              key = 'Change Order';
              break;
            case 1:
              key = 'Request For Information';
              break;
            case 2:
              key = 'Purchase Order';
              break;
            case 3:
              key = 'Transmittal';
              break;
          }

          var documentStatus = {
            key: key,
            colours: [
              '#c1d64c',
              '#63b2db',
              '#F7464A',
              '#DCDCDC'
            ],
            options: {
              animationEasing: "linear",
              animationSteps: 10,
              animateScale: true
            },
            data: [0, 0, 0],
            labels: ['Submitted', 'Approved', 'Rejected']
          };

          if(angular.isDefined(resp.data.countByDocumentTemplateAndStatus.entry[i])) {

            angular.forEach(resp.data.countByDocumentTemplateAndStatus.entry[i].value, setData);
          }
          else {
            documentStatus.data.push(1);
            documentStatus.labels.push('none');
          }

          $scope.documentStatuses.push(documentStatus);
        }


      }, function(err) {

      });


    }];
  return controller;
});
