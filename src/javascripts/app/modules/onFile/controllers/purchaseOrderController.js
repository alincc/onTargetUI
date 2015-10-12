define(function (require){
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', 'notifications', 'taskFactory', 'onFileFactory', 'companyFactory', 'onContactFactory', 'userContext',
    function ($scope, $rootScope, notifications, taskFactory, onFileFactory, companyFactory, onContactFactory, userContext){

      var document = $rootScope.onFileDocument;
      $scope.purchaseOrder = {
        keyValues : {

        }
      };
      if(document) {
        $scope.purchaseOrder = document;
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

    var documentTemplate = onFileFactory.getDocumentTemplateId();

    $scope.newDocument = {
      "projectId": $rootScope.currentProjectInfo.projectId,
      "documentTemplateId": documentTemplate.PO.document_template_id,
      "documentName": documentTemplate.PO.documentName,
      "documentId": $scope.purchaseOrder.documentId || '',
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

    /*{
      "createdBy" : null,
      "createdDate" : null,
      "modifiedBy" : null,
      "modifiedDate" : null,
      "document" : null,
      "key" : "name",
      "value" : "Sebastian Praysis"
    }*/
    
    var load = function (){
      $scope.priorities = taskFactory.getTaskSeverities();
      $scope.shippingMethods = onFileFactory.getShippingMethod();
      companyFactory.search().success(function(resp) {
        $scope.companies = resp.companyList;
      });

      onContactFactory.getContactList($rootScope.currentProjectInfo.projectId,$rootScope.currentUserInfo.userId).
        success(function(content) {
          var memberList = content.projectMemberList;
          $scope.contacts = memberList;
        });
    };

      $scope.submit = function (){
        var newDocumentFormattedKeyValues = [];
        angular.forEach($scope.purchaseOrder.keyValues, function (value, key) {
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
            "userId": $scope.purchaseOrder.keyValues.name,
            "username": null,
            "password": null,
            "designation": null,
            "accountStatus": null,
            "userStatus": null,
            "userTypeId": 0
          }
        ];
        $scope.newDocument.dueDate = $scope.purchaseOrder.dueDate;

        console.log($scope.newDocument);

        onFileFactory.addNewDocument($scope.newDocument).success(function (resp){
          $scope._form.$setPristine();
        });
      };

    load();

  }];
  return controller;
});
