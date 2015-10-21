define(function (require){
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', 'notifications', 'taskFactory', 'onFileFactory', 'companyFactory', 'onContactFactory', 'userContext', '$state', 'fileFactory', '$timeout', '$q', '$modal',
    function ($scope, $rootScope, notifications, taskFactory, onFileFactory, companyFactory, onContactFactory, userContext, $state, fileFactory, $timeout, $q, $modal){
      var document = $rootScope.onFileDocument;
      $scope.document = {
        keyValues: {
        }
      };
      $scope.attachments = [];
      var documentId = '';

      if(document) {
        var attention = [];
        attention.push(document.keyValues.attention);
        console.log(attention);
        $scope.document = document;
        $scope.document.dueDate = new Date($scope.document.dueDate);
        $scope.submittal = document.submittal;
        $scope.approval = document.approval;
        $scope.onEdit = true;
        $scope.newResponse = {};
        $scope.document.keyValues.attention = attention;
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
        "gridKeyValues": [],
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
            $scope.contacts = [];
            $scope.contactLists = memberList||[];
            angular.forEach(memberList, function (projectMember, key) {
              var fullName = projectMember.contact.firstName + ' ' + projectMember.contact.lastName;
              $scope.contacts.push({userId:projectMember.userId.toString(), name: fullName});
              $scope.contactNameList.push({userId:projectMember.userId.toString(), name: fullName});
            });
          });
        if($scope.document.documentId) {
          $scope.getResponse();
        }

        if($scope.document.documentId) {
          onFileFactory.getAttachmentById($scope.document.documentId).success(
            function (resp){
              $scope.attachments = $scope.attachments.concat(resp);
            }
          );
        }
      };

      $scope.submit = function (){
        $scope.document.keyValues.rfi_is_a_change = $scope.document.keyValues.rfi_is_a_change || 'NO';

        _.each($scope.document.keyValues.attention, function (){

        });

        var newDocumentFormattedKeyValues = [];
        angular.forEach($scope.document.keyValues, function (value, key) {
          var keyValuePair = {
            "key": key,
            "value": value/*,
            "createdBy" : $scope.newDocument.submittedBy,
            "createdDate" : new Date()*/
          };
          this.push(keyValuePair);
        }, newDocumentFormattedKeyValues);
        $scope.newDocument.keyValues = newDocumentFormattedKeyValues;

        //add submittedTo user to assignees
        $scope.newDocument.assignees = [
          {
            "userId": $scope.document.keyValues.username,
            "username": null
          }
        ];

        //add attention user to assignees
        _.each($scope.document.keyValues.attention, function (attention){
          $scope.newDocument.assignees.push({userId: attention, username: null});
        });

        $scope.newDocument.dueDate = $scope.document.dueDate;

        onFileFactory.addNewDocument($scope.newDocument).success(function (resp){
          $scope.documentId = resp.document.documentId;
          var promises = [];
          if($scope.attachments.length > 0) {
            _.each($scope.attachments, function (file){
              promises.push(saveDocumentInfo(file));
            });

            $q.all(promises).then(function(values) {
              $state.go('app.onFile');
            }, function(errors) {
              $state.go('app.onFile');
              console.log(errors);
            });
          } else {
            $state.go('app.onFile');
          }
        }).finally(function (){
          $scope._form.$setPristine();
        });
      };

      $scope.addResponse = function (){
        onFileFactory.addResponse($scope.newResponse.response, $scope.document.documentId).success(
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

      $scope.getCompanyOfUser = function (){
        $scope.document.keyValues.company_name = _.result(_.find($scope.contactLists, function (contact){
          return contact.userId.toString() === $scope.document.keyValues.username;
        }), 'companyName');

        removeUserSelected();
      };
      
      var removeUserSelected = function (){
        //remove user
        $scope.contactNameList = [];
        angular.forEach($scope.contactLists, function (projectMember, key) {
          var fullName = projectMember.contact.firstName + ' ' + projectMember.contact.lastName;
          if(projectMember.userId.toString() !== $scope.document.keyValues.username) {
            $scope.contactNameList.push({userId: projectMember.userId.toString(), name: fullName});
          }
        });
        _.remove($scope.document.keyValues.attention, function(attention) {
          return attention.userId.toString() === $scope.document.keyValues.username;
        });
      };

      var uploadModalInstance;
      $scope.openUploadModal = function(){
        // open modal
        uploadModalInstance = $modal.open({
          templateUrl: 'onFile/templates/upload.html',
          controller: 'OnFileUploadController',
          size: 'lg'
        });

        // modal callbacks
        uploadModalInstance.result.then(function (data){
          $scope.attachments = $scope.attachments.concat(data);
        }, function (){

        });
      };

      $scope.removeFile = function(idx) {
        $scope.attachments.splice(idx, 1);
        $scope.$broadcast('uploadBox.DeleteFile', {idx: idx});
      };

      var saveDocumentInfo = function(file) {
        var deferred = $q.defer();
        fileFactory.move(file.filePath, null, 'projects', $rootScope.currentProjectInfo.projectAssetFolderName, 'onfile')
          .success(function(resp) {
            onFileFactory.addAttachment({
              "documentId" : $scope.documentId,
              "filePath" : resp.url,
              "addedBy" : userContext.authentication().userData.userId
            }).success(
              function (resp){
                deferred.resolve(resp);
              }).error(function (error){
                deferred.reject(error);
              });
          }).error(function (error){
            deferred.reject(error);
          });
        return deferred.promise;
      };

      load();

    }];
  return controller;
});
