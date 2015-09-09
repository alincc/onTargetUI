define(function (){
  'use strict';
  var controller = ['$scope', '$rootScope', 'notifications', function ($scope, $rootScope, notifications){
    $scope.selectedTab = 'taskManagement';
    $scope.changeTab = function (tab){
      $scope.selectedTab = tab;
    };

    $scope.activityActions = {
      addActivity: "addActivity",
      editActivity: "editActivity",
      selectActivity: "selectActivity"
    };

    $scope.activityAction = '';

    notifications.onCreateActivity($scope, function() {
      $scope.activityAction = $scope.activityActions.addActivity;
    });

    notifications.onEditActivity($scope, function() {
      $scope.activityAction = $scope.activityActions.editActivity;
    });

    notifications.onCancelActivity($scope, function() {
      $scope.activityAction = $scope.activityActions.selectActivity;
    });

    notifications.onActivitySelection($scope, function() {
      $scope.activityAction = $scope.activityActions.selectActivity;
    });

    notifications.onActivityCreated($scope, function() {
      $scope.activityAction = $scope.activityActions.selectActivity;
    });

    notifications.onActivityEdited($scope, function() {
      $scope.activityAction = $scope.activityActions.selectActivity;
    });


  }];
  return controller;
});
