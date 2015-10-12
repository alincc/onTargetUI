define(function (){
  'use strict';
  var controller = ['$scope', '$rootScope', 'notifications', 'onFileFactory', 'userContext', 'documentFactory', 'appConstant',
    function ($scope, $rootScope, notifications, onFileFactory, userContext, documentFactory, appConstant){
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

      $scope.viewDocument = function (doc, status){
        onFileFactory.getDocument(doc.documentId).success(
          function (resp){
            var document = resp.document;
            var keyValues = transformKeyValues(document.keyValues);
            if (document.gridKeyValues.length > 0) {
              document.gridKeyValues = transformGridKeyValues(document.gridKeyValues);
            }

            document.keyValues = keyValues;
            if(status === 'submittal') {
              document.submittal = true;
            } else if (status === 'approval') {
              document.approval = true;
            }

            $rootScope.onFileDocument = document;
            notifications.documentSelected();
          }
        );
      };

    }];
  return controller;
});
