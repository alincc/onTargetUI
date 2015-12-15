define(function() {
  'use strict';
  var controller = [
    '$scope',
    '$modalInstance',
    'onBimFactory',
    'project',
    function($scope,
             $modalInstance,
             onBimFactory,
             project) {
      $scope.isDeleting = false;
      $scope.delete = function() {
        $scope.isDeleting = true;
        onBimFactory.deleteProject(project.projectBimFileId)
          .then(function(resp) {
            $modalInstance.close({});
          }, function(){
            $scope.isDeleting = false;
          });
      };

      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };
    }];
  return controller;
});