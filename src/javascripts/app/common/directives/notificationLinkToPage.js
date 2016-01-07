define(function(require) {
  'use strict';
  var angular = require('angular'),
    _ = require('lodash'),
    module;
  module = angular.module('common.directives.notificationLinkToPage', []);

  module.directive('notificationLinkToPage', [
    '$state',
    'notifications',
    'taskFactory',
    '$location',
    function($state,
             notifications,
             taskFactory,
             $location) {
    return {
      restrict: 'A',
      scope: {
        notification: '=notificationLinkToPage'
      },
      link: function($scope, element, attrs) {

        function getObjectUrl() {
          if(!$scope.notification.notificationType) {
            return undefined;
          }

          var url;
          switch($scope.notification.notificationType) {
            case 'TASK_ASSIGN':
              if($state.current.name === 'app.onTime'){
                taskFactory.getTaskById($scope.notification.notificationAttributes[0].value)
                  .success(function(resp) {
                    console.log('resp', resp);

                    notifications.taskSelection({task: resp.task, action: 'logistic', tab: 'owner'});

                    // update route
                    $location.search('taskId', resp.task.projectTaskId).search('tab', 'owner');
                  });
              } else{
                url = {
                  name: 'app.onTime',
                  value: {
                    activityId: $scope.notification.notificationAttributes[1].value,
                    taskId: $scope.notification.notificationAttributes[0].value,
                    tab: 'owner'
                  }
                };
              }

              break;
            case 'TASK_ATTACHMENT':
              if($state.current.name === 'app.onTime'){
                taskFactory.getTaskById($scope.notification.notificationAttributes[0].value)
                  .success(function(resp) {
                    console.log('resp', resp);

                    notifications.taskSelection({task: resp.task, action: 'logistic', tab: 'attachment'});

                    // update route
                    $location.search('taskId', resp.task.projectTaskId).search('tab', 'attachment');
                  });
              } else{
                url = {
                  name: 'app.onTime',
                  value: {
                    activityId: $scope.notification.notificationAttributes[1].value,
                    taskId: $scope.notification.notificationAttributes[0].value,
                    tab: 'attachment'
                  }
                };
              }

              break;
            case 'TASK_STATUS':
              if($state.current.name === 'app.onTime'){
                taskFactory.getTaskById($scope.notification.notificationAttributes[0].value)
                  .success(function(resp) {
                    console.log('resp', resp);

                    notifications.taskSelection({task: resp.task, action: 'logistic', tab: 'info'});

                    // update route
                    $location.search('taskId', resp.task.projectTaskId).search('tab', 'info');
                  });
              } else{
                url = {
                  name: 'app.onTime',
                  value: {
                    activityId: $scope.notification.notificationAttributes[1].value,
                    taskId: $scope.notification.notificationAttributes[0].value,
                    tab: 'info'
                  }
                };
              }

              break;
            case 'TASK_PERCENTAGE':
              if($state.current.name === 'app.onTime'){
                taskFactory.getTaskById($scope.notification.notificationAttributes[0].value)
                  .success(function(resp) {
                    console.log('resp', resp);

                    notifications.taskSelection({task: resp.task, action: 'logistic', tab: 'progress'});

                    // update route
                    $location.search('taskId', resp.task.projectTaskId).search('tab', 'progress');
                  });
              } else{
                url = {
                  name: 'app.onTime',
                  value: {
                    activityId: $scope.notification.notificationAttributes[1].value,
                    taskId: $scope.notification.notificationAttributes[0].value,
                    tab: 'progress'
                  }
                };
              }
              break;
            case 'TASK_COMMENT':
              if($state.current.name === 'app.onTime'){
                taskFactory.getTaskById($scope.notification.notificationAttributes[0].value)
                  .success(function(resp) {
                    console.log('resp', resp);

                    notifications.taskSelection({task: resp.task, action: 'logistic', tab: 'comment'});

                    // update route
                    $location.search('taskId', resp.task.projectTaskId).search('tab', 'comment');
                  });
              } else{
                url = {
                  name: 'app.onTime',
                  value: {
                    activityId: $scope.notification.notificationAttributes[1].value,
                    taskId: $scope.notification.notificationAttributes[0].value,
                    tab: 'comment'
                  }
                };
              }
              break;
            case 'TASK':

              if($state.current.name === 'app.onTime'){
                taskFactory.getTaskById($scope.notification.notificationAttributes[0].value)
                  .success(function(resp) {
                    console.log('resp', resp);

                    notifications.taskSelection({task: resp.task, action: 'logistic', tab: 'info'});

                    // update route
                    $location.search('taskId', resp.task.projectTaskId).search('tab', 'info');
                  });
              }
              else{
                url = {
                  name: 'app.onTime',
                  value: {
                    activityId: $scope.notification.notificationAttributes[1].value,
                    taskId: $scope.notification.notificationAttributes[0].value,
                    tab: 'info'
                  }
                };
              }
              break;
            case 'ACTIVITY':
              url = {
                name: 'app.onTime',
                value: {
                  activityId: $scope.notification.notificationAttributes[1].value,
                  taskId: '',
                  tab: ''
                }
              };
              break;
            case 'PROJECT_FILE_COMMENT':
              url = {
                name: 'app.previewDocument',
                value: {
                  docId: $scope.notification.notificationAttributes[1].value,
                }
              };
              break;
            case 'PROJECT':
              url = {
                name: 'app.projectlist',
                value: {}
              };
              break;
            case 'DOCUMENT_RESPONSE':
              url = {
                name: 'app.onFile.RIF',
                value: {
                  docId: $scope.notification.notificationAttributes[0].value
                }
              };
              break;
            case 'DOCUMENT_STATUS':
              var name = 'app.onFile';
              if($scope.notification.text.indexOf('Change Order') > -1) {
                name = 'app.onFile.CO';
              } else if($scope.notification.text.indexOf('Request For Information') > -1) {
                name = 'app.onFile.RIF';
              } else if($scope.notification.text.indexOf('Purchase Order') > -1) {
                name = 'app.onFile.PO';
              } else if($scope.notification.text.indexOf('Transmittal') > -1) {
                name = 'app.onFile.Trans';
              }

              url = {
                name: name,
                value: {
                  docId: $scope.notification.notificationAttributes[0].value
                }
              };
              break;
            case 'DOCUMENT':
              url = {
                name: 'app.onFile',
                value: {}
              };
              break;
            default:
              url = {};
          }

          return url;
        }

        element.on('click', function() {
          var urlObject = getObjectUrl();

          if(!urlObject) {
            return;
          }

          $state.transitionTo(urlObject.name, urlObject.value);
        });
      }
    };
  }]);
  return module;
});