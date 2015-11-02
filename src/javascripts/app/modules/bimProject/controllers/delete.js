define(function() {
  'use strict';
  var controller = ['$scope', '$rootScope', '$modalInstance', 'countryFactory', 'onBimFactory', 'project',
    function($scope, $rootScope, $modalInstance, countryFactory, onBimFactory, project) {

      $scope.delete = function() {
        onBimFactory.deleteProject(project.projectBimFileId).then(
          function(resp) {
            onBimFactory.deleteBimProject(project.poid).finally(
              function (){
                $modalInstance.close({});
            });
          });
      };

      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };
    }];
  return controller;
});