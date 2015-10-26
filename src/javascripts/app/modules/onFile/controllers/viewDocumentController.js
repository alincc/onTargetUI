define(function() {
  'use strict';
  var controller = ['$scope', '$rootScope', 'notifications', 'onFileFactory', 'userContext', 'documentFactory', 'appConstant', '$state', 'permissionFactory',
    function($scope, $rootScope, notifications, onFileFactory, userContext, documentFactory, appConstant, $state, permissionFactory) {
      $scope.app = appConstant.app;
      $scope.isLoading = true;
      $scope.approvals = [];
      $scope.submittals = [];

      var viewData = function(approvals, submittals) {
        approvals = _.map(approvals, function(el) {
          var newEl = el;
          if(newEl.status === 'SUBMITTED') {
            newEl.approve = true;
          } else {
            newEl.view = true;
          }
          newEl.subject = _.pluck(_.where(newEl.keyValues, {key: 'subject'}), 'value');
          return newEl;
        });

        submittals = _.map(submittals, function(el) {
          var newEl = el;
          if(newEl.status === 'SUBMITTED') {
            newEl.edit = true;
          } else {
            newEl.view = true;
          }
          newEl.subject = _.pluck(_.where(newEl.keyValues, {key: 'subject'}), 'value');
          return newEl;
        });

        $scope.approvals = approvals.reverse();

        $scope.submittals = submittals.reverse();

        $scope.all = _.sortBy($scope.approvals.concat($scope.submittals), 'createdDate').reverse();
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
            var document = resp.document;
            //var document = doc;

            var keyValues = transformKeyValues(document.keyValues);
            if(document.gridKeyValues && document.gridKeyValues.length > 0) {
              document.gridKeyValues = transformGridKeyValues(document.gridKeyValues);
            }

            document.keyValues = keyValues;
            /*if(status === 'submittal') {
             document.submittal = true;
             } else if (status === 'approval') {
             document.approval = true;
             }*/
            document.approve = doc.status === 'APPROVED';
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

      $scope.haveApprovePermission = permissionFactory.checkFeaturePermission('ONFILE_APPROVE');
      $scope.haveRejectPermission = permissionFactory.checkFeaturePermission('ONFILE_REJECT');
      $scope.haveViewPermission = permissionFactory.checkFeaturePermission('ONFILE_VIEW');

      $scope.changeStatus = function(doc, status, $event, idx) {
        $event.stopImmediatePropagation();
        if(status === 'APPROVED' && !$scope.haveApprovePermission) {
          return;
        }
        if(status === 'REJECTED' && !$scope.haveRejectPermission) {
          return;
        }
        onFileFactory.updateStatus(doc.documentId, status, userContext.authentication().userData.userId)
          .success(function(resp) {
            doc.approve = false;
            doc.status = status;
            doc.view = true;

            //change status success
            _.remove($scope.approvals, {documentId: doc.documentId});
            _.remove($scope.all, {documentId: doc.documentId});
          });
      };

      $scope.deleteDoc = function(doc, $event) {
        $event.stopImmediatePropagation();
      };

    }];
  return controller;
});
