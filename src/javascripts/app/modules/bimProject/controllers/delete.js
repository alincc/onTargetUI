define(function() {
  'use strict';
  var controller = ['$scope', '$rootScope', '$modalInstance', 'countryFactory', 'onBimFactory', 'project',
    function($scope, $rootScope, $modalInstance, countryFactory, onBimFactory, project) {

      $scope.delete = function() {
        onBimFactory.deleteBimProject(project.projectBimFileId).then(
          function(resp) {
            $modalInstance.close({});
          });
      };

      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };
    }];
  return controller;
});