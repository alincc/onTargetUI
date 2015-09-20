define(function (){
  'use strict';
  var controller = ['$scope', '$rootScope', '$modalInstance', 'onSiteFactory', 'document',
    function ($scope, $rootScope, $modalInstance, onSiteFactory, document){
      $scope.isDeleting = false;
      $scope.delete = function() {
        $scope.isDeleting = true;
        onSiteFactory.deleteDocument(document.fileId).success(
          function(resp){
            $modalInstance.close({});
          }
        );
      };

      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };

    }];
  return controller;
});