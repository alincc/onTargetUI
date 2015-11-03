define(function (){
  'use strict';
  var controller = ['$scope', '$rootScope', '$modalInstance', 'onFileFactory', 'response',
    function ($scope, $rootScope, $modalInstance, onFileFactory, response){

      $scope.delete = function (){
        onFileFactory.deleteResponse(response.documentResponseId).success(
          function (resp){
            $modalInstance.close({});
          }
        );
      };

      $scope.cancel = function (){
        $modalInstance.dismiss('cancel');
      };
    }];
  return controller;
});