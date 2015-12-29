define(function(require) {
  'use strict';
  var angular = require('angular'),
    _ = require('lodash'),
    module;
  module = angular.module('common.directives.notificationLinkToPage', []);

  module.directive('notificationLinkToPage', [
    '$state',
    function($state) {
    return {
      restrict: 'A',
      scope: {
        notification: '=notificationLinkToPage'
      },
      link: function($scope, element, attrs) {

        console.log($scope.notification);

        function getObjectUrl() {
          if(!$scope.notification.notificationType) {
            return undefined;
          }

          var url;
          switch($scope.notification.notificationType) {
            case 'TASK_ASSIGN':
              url = {
                name: 'app.onTime',
                value: {
                  activityId: $scope.notification.notificationAttributes[1].value,
                  taskId: $scope.notification.notificationAttributes[0].value,
                  tab: 'owner'
                }
              };
              break;
            case 'TASK_ATTACHMENT':
              url = {
                name: 'app.onTime',
                value: {
                  activityId: $scope.notification.notificationAttributes[1].value,
                  taskId: $scope.notification.notificationAttributes[0].value,
                  tab: 'attachment'
                }
              };
              break;
            case 'TASK_STATUS':
              url = {
                name: 'app.onTime',
                value: {
                  activityId: $scope.notification.notificationAttributes[1].value,
                  taskId: $scope.notification.notificationAttributes[0].value,
                  tab: 'info'
                }
              };
              break;
            case 'TASK_PERCENTAGE':
              url = {
                name: 'app.onTime',
                value: {
                  activityId: $scope.notification.notificationAttributes[1].value,
                  taskId: $scope.notification.notificationAttributes[0].value,
                  tab: 'progress'
                }
              };
              break;
            case 'TASK_COMMENT':
              url = {
                name: 'app.onTime',
                value: {
                  activityId: $scope.notification.notificationAttributes[1].value,
                  taskId: $scope.notification.notificationAttributes[0].value,
                  tab: 'comment'
                }
              };
              break;
            case 'TASK':
              url = {
                name: 'app.onTime',
                value: {
                  activityId: $scope.notification.notificationAttributes[1].value,
                  taskId: $scope.notification.notificationAttributes[0].value,
                  tab: ''
                }
              };
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