define(function (require){
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', 'notifications', 'taskFactory', 'onFileFactory', 'companyFactory', 'onContactFactory', 'userContext',
    function ($scope, $rootScope, notifications, taskFactory, onFileFactory, companyFactory, onContactFactory, userContext){
      var document = $rootScope.onFileDocument;
      $scope.document = {
        keyValues: {}
      };

      if(document) {
        $scope.document = document;
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
      };

      $scope.submit = function (){
        $scope.document.keyValues.approval = $scope.checkValues.approval? 'YES' : 'NO';
        $scope.document.keyValues.for_use = $scope.checkValues.for_use? 'YES' : 'NO';
        $scope.document.keyValues.as_requested = $scope.checkValues.as_requested? 'YES' : 'NO';
        $scope.document.keyValues.review_and_comment = $scope.checkValues.review_and_comment? 'YES' : 'NO';
        $scope.document.keyValues.further_processing = $scope.checkValues.further_processing? 'YES' : 'NO';
        $scope.document.keyValues.out_for_signature = $scope.checkValues.out_for_signature? 'YES' : 'NO';
        $scope.document.keyValues.approve_as_submitted = $scope.checkValues.approve_as_submitted? 'YES' : 'NO';
        $scope.document.keyValues.approve_as_noted = $scope.checkValues.approve_as_noted? 'YES' : 'NO';
        $scope.document.keyValues.submit = $scope.checkValues.submit? 'YES' : 'NO';
        $scope.document.keyValues.resubmitted = $scope.checkValues.resubmitted? 'YES' : 'NO';
        $scope.document.keyValues.returned = $scope.checkValues.returned? 'YES' : 'NO';
        $scope.document.keyValues.returned_for_corrections = $scope.checkValues.returned_for_corrections? 'YES' : 'NO';
        $scope.document.keyValues.resubmitt = $scope.checkValues.resubmitt? 'YES' : 'NO';
        $scope.document.keyValues.received_as_noted = $scope.checkValues.received_as_noted? 'YES' : 'NO';
        $scope.document.keyValues.due_by = $scope.checkValues.due_by? 'YES' : 'NO';
        $scope.document.keyValues.received_by = $scope.checkValues.received_by? 'YES' : 'NO';
        $scope.document.keyValues.sent_date = $scope.checkValues.sent_date? 'YES' : 'NO';
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
        $scope.newDocument.dueDate = document.dueDate;

        onFileFactory.addNewDocument($scope.newDocument).success(function (resp){
          $scope._form.$setPristine();
        });
      };

      load();

    }];
  return controller;
});
