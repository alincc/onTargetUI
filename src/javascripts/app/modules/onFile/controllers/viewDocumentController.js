define(function() {
  'use strict';
  var controller = ['$scope', '$rootScope', 'notifications', 'onFileFactory', 'userContext', 'documentFactory', 'appConstant', '$state', '$timeout',
    function($scope, $rootScope, notifications, onFileFactory, userContext, documentFactory, appConstant, $state, $timeout) {
      $scope.app = appConstant.app;
      $scope.isLoading = true;
      $scope.approvals = [];
      $scope.submittals = [];

      var viewData = function(approvals, submittals) {
        for(var i = 0; i < approvals.length; i++) {
          if(approvals[i].status === 'SUBMITTED') {
            approvals[i].approve = true;
          } else {
            approvals[i].view = true;
          }
        }

        for(var j = 0; j < submittals.length; j++) {
          if(submittals[j].status === 'SUBMITTED') {
            submittals[j].edit = true;
          } else {
            submittals[j].view = true;
          }
        }
        $scope.approvals = approvals;
        $scope.submittals = submittals;
        $scope.all = $scope.approvals.concat($scope.submittals);
      };

      documentFactory.getUserDocument($rootScope.currentProjectInfo.projectId)
        .success(function(resp) {
          var approvals = resp.approvals;
          var submittals = resp.submittals;
          //$scope.all = $scope.approvals.concat($scope.submittals);
          viewData(approvals, submittals);
          $scope.isLoading = false;
        })
        .error(function(err) {
          console.log(err);
          $scope.isLoading = false;
        });
      /*onFileFactory.getDocuments(userContext.authentication().userData.username).success(
       function (resp){
       var approvals = resp.approvals;
       var submittals = resp.submittals;
       //$scope.all = $scope.approvals.concat($scope.submittals);
       viewData(approvals, submittals);
       }
       );*/

      var transformKeyValues = function(keyValues) {
        var newKeyValues = {};
        for(var i = 0; i < keyValues.length; i++) {
          var keyValue = keyValues[i];
          var key = keyValue.key;
          var value = keyValue.value;
          if(keyValue.key === 'date_created' || keyValue.key === 'date' || keyValue.key === 'received_by_date' || keyValue.key === 'sent_by_date' || keyValue.key === 'due_by_date') {
            value = new Date(value);
          }
          newKeyValues[key] = value;
        }
        return newKeyValues;
      };

      var transformGridKeyValues = function(gridKeyValues) {
        var newGridKeyValues = [];
        for(var i = 0; i < gridKeyValues.length; i++) {
          var grid = gridKeyValues[i];
          if(newGridKeyValues[grid.gridRowIndex] === undefined) {
            newGridKeyValues[grid.gridRowIndex] = {};
            /*{
             "value": grid.value,
             "key": grid.key
             }*/
            var key = grid.key;
            var value = grid.value;
            newGridKeyValues[grid.gridRowIndex][key] = value;
          } else {
            /*newGridKeyValues[grid.gridRowIndex].push({
             "value": grid.value,
             "key": grid.key
             });*/
            newGridKeyValues[grid.gridRowIndex][grid.key] = grid.value;
          }
        }

        return newGridKeyValues;
      };

      $scope.viewDocument = function(doc) {
        onFileFactory.getDocumentById(doc.documentId).success(
          function(resp) {
            //var document = resp.document;
            var document = doc;

            var keyValues = transformKeyValues(document.keyValues);
            console.log(keyValues);
            if(document.gridKeyValues.length > 0) {
              document.gridKeyValues = transformGridKeyValues(document.gridKeyValues);
            }

            document.keyValues = keyValues;
            /*if(status === 'submittal') {
             document.submittal = true;
             } else if (status === 'approval') {
             document.approval = true;
             }*/
            document.approve = doc.status === 'APPROVE';
            document.edit = doc.edit;
            document.view = doc.view;

            $rootScope.onFileDocument = document;
            notifications.documentSelected();
          }
        );
      };

      $scope.previewDocument = function(doc) {
        switch(doc.documentTemplate.documentTemplateId) {
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

      $scope.changeStatus = function(doc, status, $event, idx) {
        $event.stopImmediatePropagation();
        onFileFactory.updateStatus(doc.documentId, status, userContext.authentication().userData.userId)
          .success(function(resp) {
            doc.approve = false;
            doc.status = status;
            doc.view = true;
            //change status success
            //$scope.approvals.splice(idx, 1);
          });
      };

      $scope.deleteDoc = function(doc, $event) {
        $event.stopImmediatePropagation();
      };

    }];
  return controller;
});
