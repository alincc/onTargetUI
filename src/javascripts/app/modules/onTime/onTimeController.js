define(function (){
  'use strict';
  var controller = ['$scope', '$rootScope', function ($scope, $rootScope){
    $scope.selectedTab = 'taskManagement';
    $scope.changeTab = function (tab){
      $scope.selectedTab = tab;
    };
  }];
  return controller;
});
