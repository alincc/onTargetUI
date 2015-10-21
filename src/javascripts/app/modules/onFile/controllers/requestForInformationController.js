define(function (require) {
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', 'notifications', 'taskFactory', 'onFileFactory', 'companyFactory', 'onContactFactory', 'userContext', '$state', 'fileFactory', '$timeout', '$q', '$modal', '$window', '$filter', 'document',
    function ($scope, $rootScope, notifications, taskFactory, onFileFactory, companyFactory, onContactFactory, userContext, $state, fileFactory, $timeout, $q, $modal, $window, $filter, document) {

      $scope.document = {
        keyValues: {}
      };
      $scope.attachments = [];
      $scope.isAddingResponse = false;
      
      //user action : view, edit, create, approve
      var getUserAction = function (document) {
        if (document.createdBy === userContext.authentication().userData.userId) {
          if (document.status === 'SUBMITTED') {
            $scope.onEdit = true;
          } else {
            $scope.onView = true;
          }
        } else {
          if (document.status === 'SUBMITTED') {
            $scope.onApprove = true;
          } else {
            $scope.onView = true;
          }
        }
      };

      if (document) {
        getUserAction(document);
        var attention = [];
        angular.forEach(document.keyValues, function (value, key) {
          if (/^attention\d+/.test(key)) {
            attention.push(value);
            delete document.keyValues[key];
          }
        });

        $scope.document = document;
        $scope.documentId = document.documentId;
        $scope.document.dueDate = new Date($scope.document.dueDate);
        $scope.submittal = document.submittal;
        $scope.approval = document.approval;
        // $scope.onEdit = true;
        $scope.newResponse = {};
        $scope.document.keyValues.attention = attention;
      } else {
        $scope.onEdit = true;
      }

      $scope.dueDate = {
        options: {
          formatYear: 'yyyy',
          startingDay: 1
        },
        isOpen: false,
        open: function ($event) {
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
        if (reset) {
          $scope.attachments = [];
        }
        onFileFactory.getDocumentAttachmentsByDocumentId($scope.document.documentId).success(
          function (resp) {
            $scope.attachments = $scope.attachments.concat(resp.attachments);
            $scope.attachments = _.map($scope.attachments, function (el) {
              var newEl = el;
              newEl.uploaded = true;
              return newEl;
            });
          }
          );
      }

      var load = function () {
        $scope.priorities = taskFactory.getTaskSeverities();
        companyFactory.search().success(function (resp) {
          $scope.companies = resp.companyList;
        });

        onContactFactory.getContactList($rootScope.currentProjectInfo.projectId, $rootScope.currentUserInfo.userId).
          success(function (content) {
            var memberList = content.projectMemberList;
            $scope.contacts = [];
            $scope.contactLists = memberList || [];
            $scope.attentionName = '';
            angular.forEach(memberList, function (projectMember, key) {
              var fullName = projectMember.contact.firstName + ' ' + projectMember.contact.lastName;
              $scope.contacts.push({ userId: projectMember.userId.toString(), name: fullName });
              $scope.contactNameList.push({ userId: projectMember.userId.toString(), name: fullName });
              if (document) {
                if (projectMember.userId.toString() === document.keyValues.username) {
                  $scope.username = projectMember.contact.firstName + ' ' + projectMember.contact.lastName;
                  console.log($scope.username);
                }
                _.each(document.keyValues.attention, function (att) {
                  if (att === projectMember.userId.toString()) {
                    if ($scope.attentionName === '') {
                      $scope.attentionName = $scope.attentionName + (projectMember.contact.firstName + ' ' + projectMember.contact.lastName);
                    } else {
                      $scope.attentionName = $scope.attentionName + ', ' + (projectMember.contact.firstName + ' ' + projectMember.contact.lastName);
                    }
                  }
                });
              }

            });
          });
        if ($scope.document.documentId) {
          $scope.getResponse();
        }

        if ($scope.document.documentId) {
          loadDocumentAttachments(true);
        }
      };

      $scope.submit = function (form) {
        $scope.document.keyValues.rfi_is_a_change = $scope.document.keyValues.rfi_is_a_change || 'NO';
        var newDocumentFormattedKeyValues = [];
        angular.forEach($scope.document.keyValues, function (value, key) {
          var $this = this;
          if (key === 'attention') {
            _.each(value, function (el, idx) {
              $this.push({
                "key": 'attention' + idx,
                "value": el
              });
            });
          } else {
            var keyValuePair = {
              "key": key,
              "value": value/*,
               "createdBy" : $scope.newDocument.submittedBy,
               "createdDate" : new Date()*/
            };
            this.push(keyValuePair);
          }
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

        if ($scope.document.documentId) {
          onFileFactory.updateDocument($scope.newDocument)
            .success(function (resp) {
              var promises = [];
              if ($scope.attachments.length > 0) {
                _.each($scope.attachments, function (file) {
                  if (!file.uploaded) {
                    promises.push(saveDocumentInfo(file));
                  }
                });

                $q.all(promises).then(function (values) {
                  $state.go('app.onFile');
                  $scope.onSubmit = false;
                  form.$setPristine();
                }, function (errors) {
                  $state.go('app.onFile');
                  console.log(errors);
                  $scope.onSubmit = false;
                  form.$setPristine();
                });
              } else {
                $state.go('app.onFile');
                $scope.onSubmit = false;
                form.$setPristine();
              }
            })
            .error(function (err) {
              console.log(err);
              $scope.onSubmit = false;
              form.$setPristine();
            }).finally(function () {
              form.$setPristine();
            });
        }
        else {
          $scope.newDocument.keyValues.push({
            "key": "date_created",
            "value": new Date().toISOString()
          });
          onFileFactory.addNewDocument($scope.newDocument)
            .success(function (resp) {
              $scope.documentId = resp.document.documentId;
              var promises = [];
              if ($scope.attachments.length > 0) {
                _.each($scope.attachments, function (file) {
                  if (!file.uploaded) {
                    promises.push(saveDocumentInfo(file));
                  }
                });

                $q.all(promises).then(function (values) {
                  $state.go('app.onFile');
                  $scope.onSubmit = false;
                  form.$setPristine();
                }, function (errors) {
                  $state.go('app.onFile');
                  $scope.onSubmit = false;
                  form.$setPristine();
                  console.log(errors);
                });
              } else {
                $state.go('app.onFile');
                $scope.onSubmit = false;
                form.$setPristine();
              }
            })
            .error(function (err) {
              console.log(err);
              $scope.onSubmit = false;
              form.$setPristine();
            }).finally(function () {
              form.$setPristine();
            });
        }
      };

      $scope.addResponse = function (form) {
        $scope.isAddingResponse = true;
        onFileFactory.addResponse($scope.newResponse.response, $scope.document.documentId).success(
          function (resp) {
            //$state.go('app.onFile');
            var promises = [];
            _.each($scope.newResponse.attachments, function (file) {
              promises.push(saveDocumentInfo(file));
            });

            function done() {
              $scope.exportPdf().
                then(function () {
                  $scope.getResponse();
                  $scope.newResponse = {};
                  form.$setPristine();
                  $scope.isAddingResponse = false;
                  loadDocumentAttachments(true);
                });
            }

            $q.all(promises).then(function (values) {
              done();
            }, function (errors) {
              done();
            });

          }, function (err) {
            console.log(err);
            form.$setPristine();
            $scope.isAddingResponse = false;
          });
      };

      $scope.getResponse = function () {
        onFileFactory.getResponse($scope.document.documentId).success(
          function (resp) {
            $scope.responses = resp.documentResponses;
            console.log($scope.responses);
          }
          );
      };

      $scope.updateStatus = function (status) {
        $scope.onSubmit = true;
        onFileFactory.updateStatus($scope.document.documentId, status, userContext.authentication().userData.userId)
          .success(function (resp) {
            $scope.onSubmit = false;
            $state.go('app.onFile');
          })
          .error(
            function (err) {
              $scope.onSubmit = false;
            }
            );
      };

      $scope.getCompanyOfUser = function () {
        $scope.document.keyValues.company_name = _.result(_.find($scope.contactLists, function (contact) {
          return contact.userId.toString() === $scope.document.keyValues.username;
        }), 'companyName');

        removeUserSelected();
      };

      var removeUserSelected = function () {
        //remove user
        $scope.contactNameList = [];
        angular.forEach($scope.contactLists, function (projectMember, key) {
          var fullName = projectMember.contact.firstName + ' ' + projectMember.contact.lastName;
          if (projectMember.userId.toString() !== $scope.document.keyValues.username) {
            $scope.contactNameList.push({ userId: projectMember.userId.toString(), name: fullName });
          }
        });
        _.remove($scope.document.keyValues.attention, function (attention) {
          return attention.userId.toString() === $scope.document.keyValues.username;
        });
      };

      var uploadModalInstance;
      $scope.openUploadModal = function (from) {
        // open modal
        uploadModalInstance = $modal.open({
          templateUrl: 'onFile/templates/upload.html',
          controller: 'OnFileUploadController',
          size: 'lg',
          resolve: {
            from: function () {
              return from;
            }
          }
        });

        // modal callbacks
        uploadModalInstance.result.then(function (data) {
          console.log(data);
          if (data.from === 'main') {
            $scope.attachments = $scope.attachments.concat(data.result);
          }
          else {
            if (!$scope.newResponse.attachments) {
              $scope.newResponse.attachments = [];
            }
            $scope.newResponse.attachments = $scope.newResponse.attachments.concat(data.result);
          }
        }, function () {

        });
      };

      var saveDocumentInfo = function (file) {
        console.log('Save file', file);
        var deferred = $q.defer();
        fileFactory.move(file.filePath, null, 'projects', $rootScope.currentProjectInfo.projectAssetFolderName, 'onfile')
          .success(function (resp) {
            onFileFactory.addAttachment({
              "documentId": $scope.documentId,
              "filePath": resp.url,
              "addedBy": userContext.authentication().userData.userId
            }).success(
              function (resp) {
                deferred.resolve(resp);
              }).error(function (error) {
                deferred.reject(error);
              });
          }).error(function (error) {
            deferred.reject(error);
          });
        return deferred.promise;
      };

      $scope.exportPdf = function (download) {
        var deferred = $q.defer();
        var data = {
          document: angular.copy($scope.document),
          projectAssetFolderName: $rootScope.currentProjectInfo.projectAssetFolderName
        };
        onFileFactory.exportPdf(data)
          .success(function (resp) {
            if (download) {
              $window.open($filter('fileDownloadPathHash')(resp.filePath));
            }
            deferred.resolve();
          })
          .error(function (err) {
            deferred.resolve();
          });
        return deferred.promise;
      };

      load();

    }];
  return controller;
});
