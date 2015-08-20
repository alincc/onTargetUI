define(function() {
  'use strict';
  var controller = ['$scope', '$modalInstance', 'doc', function($scope, $modalInstance, doc) {
    $scope.doc = doc;
    $scope.users = [
      {
        label: "A"
      },
      {
        label: "B"
      }
    ];

    $scope.ok = function() {
      $modalInstance.close();
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  }];
  return controller;
});