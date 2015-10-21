define(function(require) {
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', 'notifications', 'taskFactory', 'onFileFactory', 'companyFactory', 'onContactFactory', 'userContext', '$state', 'fileFactory', '$timeout', '$q', '$modal',
    function($scope, $rootScope, notifications, taskFactory, onFileFactory, companyFactory, onContactFactory, userContext, $state, fileFactory, $timeout, $q, $modal) {
      var document = $rootScope.onFileDocument;
      $scope.document = {
        keyValues: {}
      };
      $scope.attachments = [];
      $scope.isAddingResponse = false;
      var documentId = '';

      if(document) {
        console.log(document);
        var attention = [];
        for(var prop in document.keyValues) {
          if(document.keyValues.hasOwnProperty(prop) && /^attention\d+/.test(prop)) {
            attention.push(document.keyValues[prop]);
          }
        }

        $scope.document = document;
        $scope.documentId = document.documentId;
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
        //"gridKeyValues": [],
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

      function loadDocumentAttachments(reset) {
        if(reset) {
          $scope.attachments = [];
        }
        onFileFactory.getDocumentAttachmentsByDocumentId($scope.document.documentId).success(
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

      var load = function() {
        $scope.priorities = taskFactory.getTaskSeverities();
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
              $scope.contactNameList.push({userId: projectMember.userId.toString(), name: fullName});
            });
          });
        if($scope.document.documentId) {
          $scope.getResponse();
        }

        if($scope.document.documentId) {
          loadDocumentAttachments(true);
        }
      };

      $scope.submit = function() {
        $scope.document.keyValues.rfi_is_a_change = $scope.document.keyValues.rfi_is_a_change || 'NO';
        var newDocumentFormattedKeyValues = [];

        angular.forEach($scope.document.keyValues, function(value, key) {
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

        $scope.newDocument.dueDate = $scope.document.dueDate;

        if($scope.document.documentId) {
          onFileFactory.updateDocument($scope.newDocument)
            .success(function(resp) {
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
            }).finally(function() {
              $scope._form.$setPristine();
            });
        }
        else {
          onFileFactory.addNewDocument($scope.newDocument)
            .success(function(resp) {
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
            }).finally(function() {
              $scope._form.$setPristine();
            });
        }
      };

      $scope.addResponse = function() {
        $scope.isAddingResponse = true;
        onFileFactory.addResponse($scope.newResponse.response, $scope.document.documentId).success(
          function(resp) {
            //$state.go('app.onFile');
            var promises = [];
            _.each($scope.newResponse.attachments, function(file) {
              promises.push(saveDocumentInfo(file));
            });

            function done() {
              $scope.getResponse();
              $scope.newResponse = {};
              $scope._form._response_form.$setPristine();
              $scope.isAddingResponse = false;
              loadDocumentAttachments(true);
            }

            $q.all(promises).then(function(values) {
              done();
            }, function(errors) {
              done();
            });

          }, function(err) {
            console.log(err);
            $scope._form._response_form.$setPristine();
            $scope.isAddingResponse = false;
          });
      };

      $scope.getResponse = function() {
        onFileFactory.getResponse($scope.document.documentId).success(
          function(resp) {
            $scope.responses = resp.documentResponses;
            console.log($scope.responses);
          }
        );
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

        removeUserSelected();
      };

      var removeUserSelected = function() {
        //remove user
        $scope.contactNameList = [];
        angular.forEach($scope.contactLists, function(projectMember, key) {
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
      $scope.openUploadModal = function(from) {
        // open modal
        uploadModalInstance = $modal.open({
          templateUrl: 'onFile/templates/upload.html',
          controller: 'OnFileUploadController',
          size: 'lg',
          resolve: {
            from: function() {
              return from;
            }
          }
        });

        // modal callbacks
        uploadModalInstance.result.then(function(data) {
          console.log(data);
          if(data.from === 'main') {
            $scope.attachments = $scope.attachments.concat(data.result);
          }
          else {
            if(!$scope.newResponse.attachments) {
              $scope.newResponse.attachments = [];
            }
            $scope.newResponse.attachments = $scope.newResponse.attachments.concat(data.result);
          }
        }, function() {

        });
      };

      var saveDocumentInfo = function(file) {
        console.log('Save file', file);
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
