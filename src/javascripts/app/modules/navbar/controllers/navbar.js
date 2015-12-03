define(function(require) {
  'use strict';
  var _ = require('lodash');
  var controller = ['$scope', 'appConstant', 'accountFactory', '$state', '$location', 'notifications', '$rootScope', '$modal', 'companyFactory', 'pushFactory', 'userNotificationsFactory', 'toaster', '$q',
    function($scope, appConstant, accountFactory, $state, $location, notifications, $rootScope, $modal, companyFactory, pushFactory, userNotificationsFactory, toaster, $q) {
      $scope.app = appConstant.app;
      $scope.viewNotifications = [];

      function bindInfo() {
        $scope.userInfo = {
          firstName: $rootScope.currentUserInfo.contact.firstName,
          lastName: $rootScope.currentUserInfo.contact.lastName,
          email: $rootScope.currentUserInfo.contact.email,
          avatar: $rootScope.currentUserInfo.contact.userImagePath
        };
      }

      function bindUserNotifications() {
        $scope.allNotifications = $rootScope.userNotifications.notificationList;
        //$scope.newNotifications = _.where($scope.allNotifications, {"status": "NEW"});
        $scope.totalUnreadNotification = $rootScope.userNotifications.totalUnreadNotification;
        $scope.viewNotifications = $rootScope.userNotifications.notificationList;
      }

      if($rootScope.currentUserInfo && $rootScope.currentUserInfo.contact) {
        bindInfo();
      }

      $scope.logout = function() {
        // unbind channels
        console.log('unbind all events');
        pushFactory.unbindAll(true);
        accountFactory.logout()
          .then(function() {
            notifications.logoutSuccess();

            $state.go('signin');
          });
      };

      $scope.inviteCollaborators = function() {
        companyFactory.search().success(function(resp) {
          $modal.open({
            templateUrl: 'navbar/templates/inviteCollaborators.html',
            controller: 'InviteCollaboratorsController',
            size: 'md',
            resolve: {
              companies: function() {
                return resp.companyList;
              }
            }
          });
        });
      };

      notifications.onLoginSuccess($scope, function() {
        if($rootScope.currentUserInfo && $rootScope.currentUserInfo.contact) {
          bindInfo();
        }
      });

      notifications.onUpdateProfileSuccess($scope, function() {
        bindInfo();
      });

      notifications.onGetNotificationSuccess($scope, function() {
        bindUserNotifications();
      });

      notifications.onCurrentProjectChanged($scope, _.debounce(function(data) {
        console.log(data);
        // Unbind old project event
        if(data.oldProject) {
          console.log('unbind event: ' + 'private-project-' + data.oldProject.projectId + ':user-' + $rootScope.currentUserInfo.userId);
          pushFactory.unbind('private-project-' + data.oldProject.projectId + ':user-' + $rootScope.currentUserInfo.userId);
        }
        if(data.newProject) {
          // Bind new project event
          bindProjectEvent(data.newProject.projectId);
        } else {
          // Unbind all event
          pushFactory.unbindAll();
        }
      }, 1000));

      var canceler;
      var getAllNotifications = function() {
        if(canceler) {
          canceler.resolve();
        }
        canceler = $q.defer();
        userNotificationsFactory.getAll({
          "pageNumber": 1,
          "perPageLimit": 5
        }, canceler).then(function(resp) {
          $rootScope.userNotifications = resp.data;
          notifications.getNotificationSuccess();
        });
      };

      function bindProjectEvent(projectId) {
        console.log('bind event: ' + 'private-project-' + projectId + ':user-' + $rootScope.currentUserInfo.userId);
        pushFactory.bind('private-project-' + projectId + ':user-' + $rootScope.currentUserInfo.userId, function(data) {
          getAllNotifications();
          toaster.pop('info', 'Info', data.message);
        });
      }

      function bindChannel() {
        if($rootScope.currentUserInfo.userId) {
          console.log('bind event: ' + 'private-user-' + $rootScope.currentUserInfo.userId);
          pushFactory.bind('private-user-' + $rootScope.currentUserInfo.userId, function(data) {
            if($rootScope.currentUserInfo.userId) {
              getAllNotifications();
              toaster.pop('info', 'Info', data.message);
            }
          });
        }

        if($rootScope.currentProjectInfo) {
          bindProjectEvent($rootScope.currentProjectInfo.projectId);
        }
      }

      bindChannel();

      notifications.onLoginSuccess($scope, function() {
        console.log('unbind all events');
        pushFactory.unbindAll(true);
        console.log('bind global event');
        pushFactory.bindGlobalChannel();
        bindChannel();
      });

      $scope.maskAsRead = function() {
        if($scope.totalUnreadNotification > 0) {
          //$scope.viewNotifications = $scope.allNotifications;
          $scope.totalUnreadNotification = 0;
          userNotificationsFactory.maskAsRead().success(
            function(resp) {
              //console.log(resp);
              getAllNotifications();
            }
          );
        }
      };
    }];
  return controller;
});