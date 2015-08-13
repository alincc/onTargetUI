/**
 * Created by thophan on 8/12/2015.
 */
define(function() {
  'use strict';
  var controller = ['$scope', '$rootScope', '$modalInstance', 'project', 'companies', function($scope, $rootScope, $modalInstance, project, companies) {
    console.log(project);
    $scope.projectModel = {
      name: project.projectName,
      description: project.projectDescription,
      type: project.projectTypeId,
      //unitOfMeasurement: '',
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      projectImage: project.projectImagePath,
      address1: project.projectAddress.address1,
      address2: project.projectAddress.address2,
      city: project.projectAddress.city,
      country: project.projectAddress.country,
      state: project.projectAddress.state,
      zipCode: project.projectAddress.zip
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