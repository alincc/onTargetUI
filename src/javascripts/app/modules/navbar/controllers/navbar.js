define(function() {
  'use strict';
  var controller = ['$scope', 'appConstant', 'accountFactory', '$state', '$location', 'notifications', '$rootScope', '$modal', 'companyFactory', 'pushFactory', 'userNotificationsFactory', 'toaster',
    function($scope, appConstant, accountFactory, $state, $location, notifications, $rootScope, $modal, companyFactory, pushFactory, userNotificationsFactory, toaster) {
      $scope.app = appConstant.app;

      function bindInfo() {
        $scope.userInfo = {
          firstName: $rootScope.currentUserInfo.contact.firstName,
          lastName: $rootScope.currentUserInfo.contact.lastName,
          email: $rootScope.currentUserInfo.contact.email,
          avatar: $rootScope.currentUserInfo.contact.userImagePath
        };
      }

      function bindUserNotifications() {
        $scope.allNotifications = $rootScope.userNotifications;
        $scope.newNotifications = _.where($scope.allNotifications, {"status": "NEW"});
      }

      if($rootScope.currentUserInfo && $rootScope.currentUserInfo.contact) {
        bindInfo();
      }

      $scope.logout = function() {
        // unbind channels
        pushFactory.unbind('onTargetAll');
        pushFactory.unbind('private-user-' + $rootScope.currentUserInfo.userId);
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

      console.log('Register channel: ', 'private-user-' + $rootScope.currentUserInfo.userId);
      pushFactory.bind('private-user-' + $rootScope.currentUserInfo.userId, function(data) {
        console.log(data);
        // Reload notifications
        userNotificationsFactory.getAll({
          "pageNumber": 1,
          "perPageLimit": appConstant.app.settings.userNotificationsPageSize,
          "userId": $rootScope.currentUserInfo.userId
        });

        toaster.pop('success', 'Success', data.message);
      });
    }];
  return controller;
});