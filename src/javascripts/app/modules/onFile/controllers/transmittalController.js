define(function (require){
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', 'notifications', 'taskFactory', 'onFileFactory', 'companyFactory', 'onContactFactory', 'userContext', '$state',
    function ($scope, $rootScope, notifications, taskFactory, onFileFactory, companyFactory, onContactFactory, userContext, $state){
      $scope.action = $scope.actions.transmittal;
      var document = $rootScope.onFileDocument;
      $scope.document = {
        keyValues: {}
      };

      if(document) {
        $scope.document = document;
        $scope.document.dueDate = new Date($scope.document.dueDate);
        $scope.submittal = document.submittal;
        $scope.approval = document.approval;
      }

      $scope.dueDate = {
        options: {
          formatYear: 'yyyy',
          startingDay: 1
        },
        isOpen: false,
        open: function($event) {
          this.isOpen = true;
        }
      };
      $scope.dueByDate = {
        options: {
          formatYear: 'yyyy',
          startingDay: 1
        },
        isOpen: false,
        open: function($event) {
          this.isOpen = true;
        }
      };
      $scope.receivedDate = {
        options: {
          formatYear: 'yyyy',
          startingDay: 1
        },
        isOpen: false,
        open: function($event) {
          this.isOpen = true;
        }
      };
      $scope.sentDate = {
        options: {
          formatYear: 'yyyy',
          startingDay: 1
        },
        isOpen: false,
        open: function($event) {
          this.isOpen = true;
        }
      };
      $scope.date = {
        options: {
          formatYear: 'yyyy',
          startingDay: 1
        },
        isOpen: false,
        open: function($event) {
          this.isOpen = true;
        }
      };

      var documentTemplate = onFileFactory.getDocumentTemplateId();
      $scope.contacts = [];
      $scope.companies = [];

      $scope.newDocument = {
        "projectId": $rootScope.currentProjectInfo.projectId,
        "documentTemplateId": documentTemplate.Trans.document_template_id,
        "documentName": documentTemplate.Trans.documentName,
        "documentId": $scope.document.documentId || '',
        "dueDate": '',
        "keyValues": [],
        "gridKeyValues": null,
        "submittedBy": userContext.authentication().userData.userId,
        "submitter": {
          "userId": userContext.authentication().userData.userId,
          "username": userContext.authentication().userData.username,
          "password": null,
          "designation": null,
          "accountStatus": null,
          "userStatus": null,
          "userTypeId": 0
        }
      };

      var load = function (){
        companyFactory.search().success(function(resp) {
          $scope.companies = resp.companyList;
        });
        onContactFactory.getContactList($rootScope.currentProjectInfo.projectId,$rootScope.currentUserInfo.userId).
          success(function(content) {
            var memberList = content.projectMemberList;
            $scope.contacts = memberList || [];
          });
        $scope.items = onFileFactory.getItems();
        $scope.submittedFors = onFileFactory.getSubmittedFor();
        $scope.actionsAsNoted = onFileFactory.getActionAsNoted();
        var i = 0;
        for (i = 0; i < $scope.submittedFors.length; i++) {
          $scope.submittedFors[i].value = _.result(_.findWhere($scope.document.keyValues, {'key': $scope.submittedFors[i].key}), 'value') || 'NO';
        }
        for (i = 0; i < $scope.actionsAsNoted.length; i++) {
          $scope.actionsAsNoted[i].value = _.result(_.findWhere($scope.document.keyValues, {'key': $scope.actionsAsNoted[i].key}), 'value') || 'NO';
        }
      };

      $scope.submit = function (){
        var newDocumentFormattedKeyValues = [];
        angular.forEach($scope.document.keyValues, function (value, key) {
          var keyValuePair =
          {
            "key": key,
            "value": value,
            "createdBy" : $scope.newDocument.submittedBy,
            "createdDate" : new Date()
          };
          this.push(keyValuePair);
        }, newDocumentFormattedKeyValues);
        $scope.newDocument.keyValues = newDocumentFormattedKeyValues;
        $scope.newDocument.keyValues = $scope.newDocument.keyValues.concat($scope.submittedFors);
        $scope.newDocument.keyValues = $scope.newDocument.keyValues.concat($scope.actionsAsNoted);
        $scope.newDocument.assignees = [
          {
            "userId": $scope.document.keyValues.name,
            "username": null,
            "password": null,
            "designation": null,
            "accountStatus": null,
            "userStatus": null,
            "userTypeId": 0
          }
        ];
        $scope.newDocument.dueDate = $scope.document.dueDate;

        onFileFactory.addNewDocument($scope.newDocument).success(function (resp){
          $scope._form.$setPristine();
        });
      };

      $scope.updateStatus = function(status){
        $scope.onSubmit = true;
        onFileFactory.updateStatus($scope.document.documentId, status, userContext.authentication().userData.userId)
          .success(function (resp){
            $scope.onSubmit = false;
            $state.go('app.onFile');
          })
          .error(
          function (err){
            $scope.onSubmit = false;
          }
        );
      };

      load();

    }];
  return controller;
});
