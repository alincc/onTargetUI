define(function (){
  'use strict';
  var controller = ['$scope', '$rootScope', 'notifications', function ($scope, $rootScope, notifications){
    $scope.actions = {
      viewDocument: {
        name: "viewDocument"
      },
      changeOrder: {
        name: "changeOrder"
      },
      requestForInformation: {
        name: "requestForInformation"
      },
      purchaseOrder: {
        name: "purchaseOrder"
      },
      transmittal: {
        name: "transmittal"
      }
    };
    $scope.action = $scope.actions.viewDocument;
    
    $scope.openAction = function (action){
      $scope.action = action;
    };

    notifications.onDocumentSelected($scope, function(args) {
      var templateId = $rootScope.onFileDocument.documentTemplate.documentTemplateId;
      switch (templateId) {
        case 1:
          $scope.action = $scope.actions.purchaseOrder;
          break;
        case 2:
          $scope.action = $scope.actions.changeOrder;
          break;
        case 3:
          $scope.action = $scope.actions.requestForInformation;
          break;
        case 4:
          $scope.action = $scope.actions.transmittal;
          break;
        default :
          $scope.action = $scope.actions.viewDocument;
          break;
      }
    });
  }];
  return controller;
});
