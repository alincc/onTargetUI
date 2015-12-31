define(function(require) {
  'use strict';
  var _ = require('lodash');
  var controller = ['$scope', 'appConstant', 'accountFactory', '$state', '$location', 'notifications', '$rootScope', '$modal', 'companyFactory', 'pushFactory', 'userNotificationsFactory', 'toaster', '$q',
    function($scope, appConstant, accountFactory, $state, $location, notifications, $rootScope, $modal, companyFactory, pushFactory, userNotificationsFactory, toaster, $q) {
      $scope.app = appConstant.app;
      $scope.viewNotifications = [];
      var canceler;

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

      function getAllNotifications() {
        if(canceler) {
          canceler.resolve();
        }
        canceler = $q.defer();

        if($rootScope.currentUserInfo.userId && $rootScope.currentProjectInfo.projectId) {
          userNotificationsFactory.getAll({
            "pageNumber": 1,
            "perPageLimit": 5
          }, canceler).then(function(resp) {
            $rootScope.userNotifications = resp.data;
            notifications.getNotificationSuccess();
          });
        }
      }

      function bindProjectEvent(projectId) {
        pushFactory.bind('private-project-' + projectId + ':user-' + $rootScope.currentUserInfo.userId, function(data) {
          console.log('Incoming data for ' + 'private-project-' + projectId + ':user-' + $rootScope.currentUserInfo.userId + ': ', data);
          getAllNotifications();
          toaster.pop('info', 'Info', data.message);
        });
      }

      function bindChannel() {
        if($rootScope.currentUserInfo.userId) {
          pushFactory.bind('private-user-' + $rootScope.currentUserInfo.userId, function(data) {
            console.log('Incoming data for ' + 'private-user-' + $rootScope.currentUserInfo.userId + ': ', data);
            getAllNotifications();
            toaster.pop('info', 'Info', data.message);
          });
        }

        if($rootScope.currentProjectInfo.projectId) {
          bindProjectEvent($rootScope.currentProjectInfo.projectId);
        }
      }

      if($rootScope.currentUserInfo && $rootScope.currentUserInfo.contact) {
        bindInfo();
      }

      $scope.logout = function() {
        // unbind channels
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
        // Unbind old project event
        if(data.oldProject) {
          pushFactory.unbind('private-project-' + data.oldProject.projectId + ':user-' + $rootScope.currentUserInfo.userId);
        }
        if(data.newProject) {
          // Bind new project event
          bindProjectEvent(data.newProject.projectId);
        }
      }, 1000));

      bindChannel();

      notifications.onLoginSuccess($scope, function() {
        pushFactory.unbindAll(true);
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

      //first load notifications
      getAllNotifications();
    }];
  return controller;
});