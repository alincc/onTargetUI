define(function (require){
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', 'notifications', 'taskFactory', 'onFileFactory', 'companyFactory', 'onContactFactory', 'userContext', 'fileFactory', '$timeout',
    function ($scope, $rootScope, notifications, taskFactory, onFileFactory, companyFactory, onContactFactory, userContext, fileFactory, $timeout){
      var document = $rootScope.onFileDocument;
      $scope.changeOrder = {
        keyValues: {}
      };

      if(document) {
        $scope.changeOrder = document;
        $scope.submittal = document.submittal;
        $scope.approval = document.approval;
      }

      $scope.dueDate = {
        options: {
          formatYear: 'yyyy',
          startingDay: 1
        },
        isOpen: false,
        open: function ($event){
          this.isOpen = true;
        }
      };

      $scope.dateCreated = {
        options: {
          formatYear: 'yyyy',
          startingDay: 1
        },
        isOpen: false,
        open: function ($event){
          this.isOpen = true;
        }
      };

      $scope.attachment = {
        file: null
      };

      var documentTemplate = onFileFactory.getDocumentTemplateId();

      $scope.newDocument = {
        "projectId": $rootScope.currentProjectInfo.projectId,
        "documentTemplateId": documentTemplate.CO.document_template_id,
        "documentName": documentTemplate.CO.documentName,
        "documentId": $scope.changeOrder.documentId || '',
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


      $scope.costGrid = [];

      $scope.addCostGrid = function (){
        var cost = {
          workDescription: '',
          costCode: '',
          amount: ''
        };
        $scope.costGrid.push(cost);
      };

      $scope.removeCostGrid = function (){
        if ($scope.costGrid.length > 1) {
          $scope.costGrid.pop();
        }
      };

      var load = function (){
        $scope.priorities = taskFactory.getTaskSeverities();
        $scope.shippingMethods = onFileFactory.getShippingMethod();
        $scope.changeOrders = [];
        $scope.disciplines = onFileFactory.getDisciplines();
        $scope.categories = onFileFactory.getCategories();
        $scope.schedule_impacts = [];
        companyFactory.search().success(function (resp){
          $scope.companies = resp.companyList;
        });

        onContactFactory.getContactList($rootScope.currentProjectInfo.projectId, $rootScope.currentUserInfo.userId).
          success(function (content){
            var memberList = content.projectMemberList;
            $scope.contacts = memberList;
          });

        $scope.addCostGrid();
      };

      $scope.submit = function (){
        $scope.onSubmit = true;
        var newDocumentFormattedKeyValues = [];
        angular.forEach($scope.changeOrder.keyValues, function (value, key){
          var keyValuePair = {
            "key": key,
            "value": value,
            "createdBy" : $scope.newDocument.submittedBy,
            "createdDate" : new Date()
          };
          this.push(keyValuePair);
        }, newDocumentFormattedKeyValues);
        $scope.newDocument.keyValues = newDocumentFormattedKeyValues;
        $scope.newDocument.dueDate = $scope.changeOrder.dueDate;

        var gridKeyValues = [];
        for (var i = 0; i < $scope.costGrid.length; i++) {
          var costGridRow = $scope.costGrid[i];
          var gridKeyValue = {};
          var keys = ["workDescription", "costCode", "amount"];
          var rowValid = true;
          for (var j = 0; j < keys.length; j++) {
            if (!costGridRow[keys[j]]) {
              rowValid = false;
              break;
            }
          }
          if (rowValid) {
            gridKeyValue.gridRowIndex = i;
            for (var k = 0; k < keys.length; k++) {
              var gridvalue = {
                key: keys[k],
                value: costGridRow[keys[k]],
                gridId: "CO-COSTGRID",
                gridRowIndex: i
              };
              gridKeyValues.push(gridvalue);
            }
          }
        }
        $scope.newDocument.gridKeyValues = gridKeyValues;

        $scope.newDocument.assignees = [
          {
            "userId": $scope.changeOrder.keyValues.name,
            "username": null,
            "password": null,
            "designation": null,
            "accountStatus": null,
            "userStatus": null,
            "userTypeId": 0
          }
        ];

        console.log($scope.newDocument);

        onFileFactory.addNewDocument($scope.newDocument).success(function (resp){
          $scope.documentId = resp.document.documentId;
          if($scope.attachment.file) {
            $scope.upload([$scope.attachment.file]);
          } else {
            $scope.onSubmit = false;
          }
        }.error(
          function (error){
            $scope.onSubmit = false;
          }
        ));
      };

      $scope.upload = function (file){
        fileFactory.upload(file, null, 'change-order')
          .success(function (data, status, headers, config){
            $timeout(function (){
              $scope.filePath = data.url;
              //upload success - notify to add attachment
              notifications.documentUploaded();
            });
          }).error(function (){
            $scope.onSubmit = false;
          });
      };

      notifications.onDocumentUploaded($scope, function(args) {
        //attach document
        addAttachment();
      });

      var addAttachment = function (){
        onFileFactory.addAttachment({
          "documentId" : $scope.documentId,
          "filePath" : $scope.filePath,
          "addedBy" : userContext.authentication().userData.userId
        }).success(
          function (resp){
            //attachment success
          }
        ).finally(
          function (e){
            $scope.onSubmit = false;
          }
        );
      };

      load();

    }];
  return controller;
});
