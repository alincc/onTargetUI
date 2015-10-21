define(function(require) {
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', 'notifications', 'taskFactory', 'onFileFactory', 'companyFactory', 'onContactFactory', 'userContext', '$state', '$q', '$modal', 'fileFactory',
    function($scope, $rootScope, notifications, taskFactory, onFileFactory, companyFactory, onContactFactory, userContext, $state, $q, $modal, fileFactory) {
      var document = $rootScope.onFileDocument;
      $scope.document = {
        keyValues: {}
      };
      $scope.attachments = [];

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
        //"gridKeyValues": [],
        "submittedBy": userContext.authentication().userData.userId
        /*"submitter": {
         "userId": userContext.authentication().userData.userId,
         "username": userContext.authentication().userData.username,
         "password": null,
         "designation": null,
         "accountStatus": null,
         "userStatus": null,
         "userTypeId": 0
         }*/
      };

      var load = function() {
        companyFactory.search().success(function(resp) {
          $scope.companies = resp.companyList;
        });
        onContactFactory.getContactList($rootScope.currentProjectInfo.projectId, $rootScope.currentUserInfo.userId).
          success(function(content) {
            var memberList = content.projectMemberList;
            $scope.contacts = [];
            $scope.contactLists = memberList || [];
            angular.forEach(memberList, function(projectMember, key) {
              var fullName = projectMember.contact.firstName + ' ' + projectMember.contact.lastName;
              $scope.contacts.push({userId: projectMember.userId.toString(), name: fullName});
            });
          });
        $scope.items = onFileFactory.getItems();
        $scope.submittedFors = onFileFactory.getSubmittedFor();
        $scope.actionsAsNoted = onFileFactory.getActionAsNoted();
        var i = 0;
        for(i = 0; i < $scope.submittedFors.length; i++) {
          $scope.submittedFors[i].value = _.result(_.findWhere($scope.document.keyValues, {'key': $scope.submittedFors[i].key}), 'value') || 'NO';
        }
        for(i = 0; i < $scope.actionsAsNoted.length; i++) {
          $scope.actionsAsNoted[i].value = _.result(_.findWhere($scope.document.keyValues, {'key': $scope.actionsAsNoted[i].key}), 'value') || 'NO';
        }

        if($scope.document.documentId) {
          onFileFactory.getDocumentAttachmentsByDocumentId($scope.changeOrder.documentId).success(
            function(resp) {
              $scope.attachments = $scope.attachments.concat(resp.attachments);
              $scope.attachments = _.map($scope.attachments, function(el) {
                var newEl = el;
                newEl.uploaded = true;
                return newEl;
              });
            }
          );
        }
      };

      $scope.submit = function() {
        var newDocumentFormattedKeyValues = [];
        angular.forEach($scope.document.keyValues, function(value, key) {
          var keyValuePair =
          {
            "key": key,
            "value": value/*,
           "createdBy" : $scope.newDocument.submittedBy,
           "createdDate" : new Date()*/
          };
          this.push(keyValuePair);
        }, newDocumentFormattedKeyValues);
        $scope.newDocument.keyValues = newDocumentFormattedKeyValues;
        $scope.newDocument.keyValues = $scope.newDocument.keyValues.concat($scope.submittedFors);
        $scope.newDocument.keyValues = $scope.newDocument.keyValues.concat($scope.actionsAsNoted);
        $scope.newDocument.assignees = [
          {
            "userId": $scope.document.keyValues.username,
            "username": null
          }
        ];
        $scope.newDocument.dueDate = $scope.document.dueDate;
        if($scope.document.documentId) {
          onFileFactory.updateDocument($scope.newDocument).success(function(resp) {
            $scope.documentId = resp.document.documentId;
            var promises = [];
            if($scope.attachments.length > 0) {
              _.each($scope.attachments, function(file) {
                if(!file.uploaded) {
                  promises.push(saveDocumentInfo(file));
                }
              });

              $q.all(promises).then(function(values) {
                $state.go('app.onFile');
                $scope.onSubmit = false;
                $scope._form.$setPristine();
              }, function(errors) {
                $state.go('app.onFile');
                console.log(errors);
                $scope.onSubmit = false;
                $scope._form.$setPristine();
              });
            } else {
              $state.go('app.onFile');
              $scope.onSubmit = false;
              $scope._form.$setPristine();
            }
          })
            .error(function(err) {
              console.log(err);
              $scope.onSubmit = false;
              $scope._form.$setPristine();
            }).finally(
            function() {
              $scope._form.$setPristine();
            }
          );
        }
        else {
          onFileFactory.addNewDocument($scope.newDocument).success(function(resp) {
            $scope.documentId = resp.document.documentId;
            var promises = [];
            if($scope.attachments.length > 0) {
              _.each($scope.attachments, function(file) {
                if(!file.uploaded) {
                  promises.push(saveDocumentInfo(file));
                }
              });

              $q.all(promises).then(function(values) {
                $state.go('app.onFile');
                $scope.onSubmit = false;
                $scope._form.$setPristine();
              }, function(errors) {
                $state.go('app.onFile');
                $scope.onSubmit = false;
                $scope._form.$setPristine();
                console.log(errors);
              });
            } else {
              $state.go('app.onFile');
              $scope.onSubmit = false;
              $scope._form.$setPristine();
            }
          })
            .error(function(err) {
              console.log(err);
              $scope.onSubmit = false;
              $scope._form.$setPristine();
            }).finally(
            function() {
              $scope._form.$setPristine();
            }
          );
        }

      };

      $scope.updateStatus = function(status) {
        $scope.onSubmit = true;
        onFileFactory.updateStatus($scope.document.documentId, status, userContext.authentication().userData.userId)
          .success(function(resp) {
            $scope.onSubmit = false;
            $state.go('app.onFile');
          })
          .error(
          function(err) {
            $scope.onSubmit = false;
          }
        );
      };

      $scope.getCompanyOfUser = function() {
        $scope.document.keyValues.company_name = _.result(_.find($scope.contactLists, function(contact) {
          return contact.userId.toString() === $scope.document.keyValues.username;
        }), 'companyName');
      };

      var uploadModalInstance;
      $scope.openUploadModal = function() {
        // open modal
        uploadModalInstance = $modal.open({
          templateUrl: 'onFile/templates/upload.html',
          controller: 'OnFileUploadController',
          size: 'lg'
        });

        // modal callbacks
        uploadModalInstance.result.then(function(data) {
          $scope.attachments = $scope.attachments.concat(data);
        }, function() {

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
              "documentId": $scope.documentId,
              "filePath": resp.url,
              "addedBy": userContext.authentication().userData.userId
            }).success(
              function(resp) {
                deferred.resolve(resp);
              }).error(function(error) {
                deferred.reject(error);
              });
          }).error(function(error) {
            deferred.reject(error);
          });
        return deferred.promise;
      };

      load();

    }];
  return controller;
});
