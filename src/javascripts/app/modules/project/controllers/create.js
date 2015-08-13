/**
 * Created by thophan on 8/12/2015.
 */
define(function() {
  'use strict';
  var controller = ['$scope', '$rootScope', '$modalInstance', function($scope, $rootScope, $modalInstance) {

    $scope.projectModel = {
      name: '',
      description: '',
      type: 1,
      unitOfMeasurement: '',
      status: '',
      startDate: '',
      endDate: '',
      projectImage: '',
      address1: '',
      address2: '',
      city: '',
      country: '',
      state: '',
      zipCode: ''
    };

    $scope.save = function() {
      $modalInstance.close({});
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  }];
  return controller;
});