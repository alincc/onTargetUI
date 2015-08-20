/**
 * Created by thophan on 8/20/2015.
 */
define(function (){
  'use strict';
  var controller = ['$scope', '$rootScope', 'countryFactory', 'projectFactory', 'userContext', 'projectContext', 'activityFactory', 'toaster', 'taskFactory', 'notifications',
    function ($scope, $rootScope, countryFactory, projectFactory, userContext, projectContext, activityFactory, toaster, taskFactory, notifications){

      $scope.task = $rootScope.currentTask;
      notifications.onTaskSelection($scope, function (){
          $scope.task = $rootScope.currentTask;
        }
      );


    }];
  return controller;
});