define(function (){
  'use strict';

  var controller = ['$scope', '$rootScope', 'userNotificationsFactory', 'appConstant',
  function($scope, $rootScope, userNotificationsFactory, constant) {
    $scope.params = {
      page: 1,
      per_page: 20
    };
    $scope.isLoading = false;

    $scope.load = function(page) {
      if (!$scope.isLoading) {
        $scope.isLoading = true;

        userNotificationsFactory.getByPage(page || 1, $scope.params.per_page).then(
          function(resp) {
            $scope.notifications = resp.data.notificationList;
            $scope.totalNotifications = resp.data.totalNotification;
            $scope.isLoading = false;
          }, function(err) {
            console.log(err);
            $scope.isLoading = false;
          }
        );
      }
    };

    // page change callbacks
    $scope.pageChange = function(page) {
      $scope.load(page);
    };

    $scope.load();
  }];

  return controller;
});