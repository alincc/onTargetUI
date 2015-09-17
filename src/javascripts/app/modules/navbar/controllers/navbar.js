define(function (){
  'use strict';
  var controller = ['$scope', 'appConstant', 'accountFactory', '$state', '$location', 'notifications', '$rootScope', '$modal', 'companyFactory', 'pushFactory', 'userNotificationsFactory', 'toaster',
    function ($scope, appConstant, accountFactory, $state, $location, notifications, $rootScope, $modal, companyFactory, pushFactory, userNotificationsFactory, toaster){
      $scope.app = appConstant.app;

      function bindInfo(){
        $scope.userInfo = {
          firstName: $rootScope.currentUserInfo.contact.firstName,
          lastName: $rootScope.currentUserInfo.contact.lastName,
          email: $rootScope.currentUserInfo.contact.email,
          avatar: $rootScope.currentUserInfo.contact.userImagePath
        };
      }

      function bindUserNotifications(){
        $scope.allNotifications = $rootScope.userNotifications.notificationList;
        //$scope.newNotifications = _.where($scope.allNotifications, {"status": "NEW"});
        $scope.totalUnreadNotification = $rootScope.userNotifications.totalUnreadNotification;
      }

      if ($rootScope.currentUserInfo && $rootScope.currentUserInfo.contact) {
        bindInfo();
      }

      $scope.logout = function (){
        // unbind channels
        pushFactory.unbind('onTargetAll');
        pushFactory.unbind('private-user-' + $rootScope.currentUserInfo.userId);
        accountFactory.logout()
          .then(function (){
            notifications.logoutSuccess();

            $state.go('signin');
          });
      };

      $scope.inviteCollaborators = function (){
        companyFactory.search().success(function (resp){
          $modal.open({
            templateUrl: 'navbar/templates/inviteCollaborators.html',
            controller: 'InviteCollaboratorsController',
            size: 'md',
            resolve: {
              companies: function (){
                return resp.companyList;
              }
            }
          });
        });
      };

      notifications.onLoginSuccess($scope, function (){
        if ($rootScope.currentUserInfo && $rootScope.currentUserInfo.contact) {
          bindInfo();
        }
      });

      notifications.onUpdateProfileSuccess($scope, function (){
        bindInfo();
      });

      notifications.onGetNotificationSuccess($scope, function (){
        bindUserNotifications();
      });

      var getAllNotifications = function (){
        userNotificationsFactory.getAll({
          "pageNumber": 1,
          "perPageLimit": appConstant.app.settings.userNotificationsPageSize
        }).then(function (resp){
          $rootScope.userNotifications = resp.data;
          notifications.getNotificationSuccess();
        });
      };

      console.log('Register channel: ', 'private-user-' + $rootScope.currentUserInfo.userId);
      pushFactory.bind('private-user-' + $rootScope.currentUserInfo.userId, function (data){
        console.log(data);
        // Reload notifications
        //userNotificationsFactory.getAll({
        //  "pageNumber": 1,
        //  "perPageLimit": appConstant.app.settings.userNotificationsPageSize
        //});
        getAllNotifications();

        toaster.pop('info', 'Info', data.message);
      });

      $scope.maskAsRead = function (){
        $scope.viewNotifications = $scope.allNotifications;
        $scope.totalUnreadNotification = 0;
        userNotificationsFactory.maskAsRead().success(
          function (resp){
            //console.log(resp);
            getAllNotifications();
          }
        );
      };
    }];
  return controller;
});