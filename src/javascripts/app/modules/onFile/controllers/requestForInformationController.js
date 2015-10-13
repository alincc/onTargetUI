define(function (require){
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', 'notifications', 'taskFactory', 'onFileFactory', 'companyFactory', 'onContactFactory', 'userContext', '$state',
    function ($scope, $rootScope, notifications, taskFactory, onFileFactory, companyFactory, onContactFactory, userContext, $state){
      var document = $rootScope.onFileDocument;
      $scope.document = {
        keyValues: {}
      };

      if(document) {
        $scope.document = document;
        $scope.document.dueDate = new Date($scope.document.dueDate);
        $scope.submittal = document.submittal;
        $scope.approval = document.approval;
        $scope.onEdit = true;
        $scope.newResponse = {};
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

      var documentTemplate = onFileFactory.getDocumentTemplateId();
      $scope.contacts = [];
      $scope.attentions = [];
      $scope.contactNameList = [];

      $scope.newDocument = {
        "projectId": $rootScope.currentProjectInfo.projectId,
        "documentTemplateId": documentTemplate.RFI.document_template_id,
        "documentName": documentTemplate.RFI.documentName,
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
        $scope.priorities = taskFactory.getTaskSeverities();
        companyFactory.search().success(function(resp) {
          $scope.companies = resp.companyList;
        });

        onContactFactory.getContactList($rootScope.currentProjectInfo.projectId,$rootScope.currentUserInfo.userId).
          success(function(content) {
            var memberList = content.projectMemberList;
            $scope.contacts = memberList || [];
            angular.forEach(memberList, function (projectMember, key) {
              var fullName = projectMember.contact.firstName + ' ' + projectMember.contact.lastName;
              $scope.contactNameList.push({userId:projectMember.userId, name: fullName});
            });
          });
        $scope.getResponse();
      };

      $scope.submit = function (){
        $scope.document.keyValues.rfi_is_a_change = $scope.document.keyValues.rfi_is_a_change || 'NO';

        var newDocumentFormattedKeyValues = [];
        angular.forEach($scope.document.keyValues, function (value, key) {
          var keyValuePair = {
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
          $state.go('app.onFile');
        });
      };

      $scope.addResponse = function (){
        onFileFactory.addResponse($scope.newResponse.response).success(
          function (resp){
            //$state.go('app.onFile');
            $scope.getResponse();
            $scope.newResponse = {};
            $scope._response_form.$setPristine();
          }
        );
      };

      $scope.getResponse = function (){
        onFileFactory.getResponse($scope.document.documentId).success(
          function (resp){
            $scope.responses = resp.documentResponses;
            console.log($scope.responses);
          }
        );
      };

      load();

    }];
  return controller;
});
