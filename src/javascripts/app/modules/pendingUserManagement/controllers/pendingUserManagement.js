define(function() {
  'use strict';
  var controller = ['$scope', 'userContext', '$state', 'appConstant', 'accountRequestFactory', function($scope, userContext, $state, appConstant, accountRequestFactory) {
    $scope.app = appConstant.app;
    $scope.isLoading = false;
    $scope.results = [];

    // fn load data
    $scope.loadData = function() {
      if(!$scope.isLoading) {
        $scope.isLoading = true;
        accountRequestFactory.search()
          .then(function(resp) {
            console.log(resp);
            $scope.results = resp.data.approvalDTOList;
            $scope.isLoading = false;
          }, function() {
            $scope.isLoading = false;
          });
      }
    };

    $scope.approve = function(user, idx) {
      accountRequestFactory.approve(user.id)
        .success(function() {
          $scope.results.splice(idx, 1);
        });
    };

    $scope.reject = function(user, idx) {

    };

    $scope.loadData();
  }];
  return controller;
});
