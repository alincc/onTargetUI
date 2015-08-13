/**
 * Created by thophan on 8/7/2015.
 */

define(function (){
  'use strict';
  var controller = ['$scope', '$rootScope', 'userContext', '$state', 'appConstant', 'accountFactory', function ($scope, $rootScope, userContext, $state, appConstant, accountFactory){

    $scope.app = appConstant.app;
    $scope.authError = '';


  }];
  return controller;
});
