define(function() {
  'use strict';
  var controller = ['$scope', '$rootScope', 'notifications', '$state', 'permissionFactory',
    function($scope, $rootScope, notifications, $state, permissionFactory) {
      $scope.uiRouterState = $state;
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

      $scope.openAction = function(action) {
        var addPermission = permissionFactory.checkFeaturePermission('ONFILE_ADD');
        if(!addPermission) {
          return;
        }
        delete $rootScope.onFileDocument;
        //$scope.action = action;
        switch(action) {
          case $scope.actions.changeOrder:
            $state.go('app.onFile.CO');
            break;
          case $scope.actions.purchaseOrder:
            $state.go('app.onFile.PO');
            break;
          case $scope.actions.requestForInformation:
            $state.go('app.onFile.RIF');
            break;
          case $scope.actions.transmittal:
            $state.go('app.onFile.Trans');
            break;
          case $scope.actions.viewDocument:
            $state.go('app.onFile');
            break;
        }
      };

      notifications.onDocumentSelected($scope, function(args) {
        var templateId = $rootScope.onFileDocument.documentTemplate.documentTemplateId;
        //
        switch(templateId) {
          case 1:
            //$scope.action = $scope.actions.purchaseOrder;
            $state.go('app.onFile.PO');
            break;
          case 2:
            //$scope.action = $scope.actions.changeOrder;
            $state.go('app.onFile.CO');
            break;
          case 3:
            //$scope.action = $scope.actions.requestForInformation;
            $state.go('app.onFile.RIF');
            break;
          case 4:
            //$scope.action = $scope.actions.transmittal;
            $state.go('app.onFile.Trans');
            break;
          default :
            $scope.action = $scope.actions.viewDocument;
            break;
        }
      });
    }];
  return controller;
});
