define(function (){
  'use strict';
  var controller = ['$scope', '$rootScope', 'notifications', 'onFileFactory', 'userContext', 'documentFactory', 'appConstant', '$state',
    function ($scope, $rootScope, notifications, onFileFactory, userContext, documentFactory, appConstant, $state){
      $scope.app = appConstant.app;

      documentFactory.getUserDocument($rootScope.currentProjectInfo.projectId).success(
        function (resp){
          console.log(resp);
          $scope.approvals = resp.approvals;
          $scope.submittals = resp.submittals;
          $scope.all = $scope.approvals.concat($scope.submittals);
        }
      );

      var transformKeyValues = function(keyValues) {
        var newKeyValues = keyValues;
        for (var i = 0; i < keyValues.length; i++) {
          var keyValue = keyValues[i];
          var key = keyValue.key;
          var value = keyValue.value;
          if(keyValue.key === 'date_created' || keyValue.key === 'date' || keyValue.key === 'received_by_date'|| keyValue.key === 'sent_by_date'||keyValue.key === 'due_by_date'){
            value = new Date(value);
          }
          newKeyValues[key] = value;
        }
        return newKeyValues;
      };

      var transformGridKeyValues = function (gridKeyValues){
        var newGridKeyValues = {};
        for (var i = 0; i < gridKeyValues.length; i++) {
          var grid = gridKeyValues[i];
          if (newGridKeyValues[grid.gridRowIndex] === undefined) {
            newGridKeyValues[grid.gridRowIndex] = [
              {
                "value": grid.value,
                "key": grid.key
              }
            ];
          } else {
            newGridKeyValues[grid.gridRowIndex].push({
              "value": grid.value,
              "key": grid.key
            });
          }
        }

        return newGridKeyValues;
      };

      $scope.viewDocument = function (doc){
        onFileFactory.getDocument(doc.documentId).success(
          function (resp){
            var document = resp.document;
            var keyValues = transformKeyValues(document.keyValues);
            if (document.gridKeyValues.length > 0) {
              document.gridKeyValues = transformGridKeyValues(document.gridKeyValues);
            }

            document.keyValues = keyValues;
            /*if(status === 'submittal') {
              document.submittal = true;
            } else if (status === 'approval') {
              document.approval = true;
            }*/

            $rootScope.onFileDocument = document;
            notifications.documentSelected();
          }
        );
      };

      $scope.previewDocument = function (doc){
        switch (doc.documentTemplate.documentTemplateId) {
          case 1:
            $state.go('app.onFile.PO', {docId: doc.documentId});
            break;
          case 2:
            $state.go('app.onFile.CO', {docId: doc.documentId});
            break;
          case 3:
            $state.go('app.onFile.RIF', {docId: doc.documentId});
            break;
          case 4:
            $state.go('app.onFile.Trans', {docId: doc.documentId});
            break;
          default :
            $scope.action = $scope.actions.viewDocument;
            break;
        }
      };

      $scope.changeStatus = function (doc, status, $event){
        $event.stopImmediatePropagation();
        onFileFactory.updateStatus(doc.documentId, status, userContext.authentication().userData.userId)
          .success(function (resp){
            //change status success
          });
      };

    }];
  return controller;
});
