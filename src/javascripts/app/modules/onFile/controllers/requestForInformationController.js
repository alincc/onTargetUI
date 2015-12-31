define(function(require) {
  'use strict';
  var angular = require('angular');
  var controller = ['$scope',
    '$rootScope',
    'notifications',
    'taskFactory',
    'onFileFactory',
    'companyFactory',
    'onContactFactory',
    'userContext',
    '$state',
    'fileFactory',
    '$timeout',
    '$q',
    '$modal',
    '$window',
    '$filter',
    'document',
    'contactList',
    'permissionFactory',
    'responses',
    function($scope,
             $rootScope,
             notifications,
             taskFactory,
             onFileFactory,
             companyFactory,
             onContactFactory,
             userContext,
             $state,
             fileFactory,
             $timeout,
             $q,
             $modal,
             $window,
             $filter,
             document,
             contactList,
             permissionFactory,
             responses) {
      var memberList = contactList;

      var removeUserSelected = function() {
        //remove user
        $scope.contactNameList = [];
        angular.forEach($scope.contactLists, function(projectMember, key) {
          var fullName = projectMember.contact.firstName + ' ' + projectMember.contact.lastName;
          if(projectMember.userId !== $scope.document.keyValues.receiverId) {
            $scope.contactNameList.push({userId: projectMember.userId, name: fullName});
          }
        });
        _.remove($scope.document.keyValues.attention, function(attention) {
          return attention === $scope.document.keyValues.receiverId;
        });
      };

      //user action : view, edit, create, approve
      var getUserAction = function(document) {
        if(!$scope.haveApprovePermission && !$scope.haveRejectPermission) {
          $scope.onView = true;
        } else {
          if(document.createdBy === userContext.authentication().userData.userId) {
            if(document.status === 'SUBMITTED') {
              $scope.onEdit = true;
            } else {
              $scope.onView = true;
            }
          } else {

            if(document.status === 'SUBMITTED') {
              $scope.onView = true;
              $scope.onApprove = true;
            } else {
              $scope.onView = true;
            }
          }
        }
      };

      $scope.document = {
        keyValues: {}
      };

      $scope.onRejecting = false;
      $scope.onApproving = false;
      $scope.onSubmit = false;
      $scope.isAllowAddResponse = false;
      $scope.isExporting = false;
      $scope.attachments = [];
      $scope.currentUserId = $rootScope.currentUserInfo.userId;
      $scope.haveApprovePermission = permissionFactory.checkFeaturePermission('ONFILE_APPROVE');
      $scope.haveRejectPermission = permissionFactory.checkFeaturePermission('ONFILE_REJECT');
      $scope.isAddingResponse = false;

      if(document) {
        getUserAction(document);
        var attention = [];
        angular.forEach(document.keyValues, function(value, key) {
          if(/^attention\d+/.test(key)) {
            attention.push(parseInt(value));
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

        $scope.isAllowAddResponse = $scope.document.keyValues.receiverId === $rootScope.currentUserInfo.userId || $scope.document.createdBy === $rootScope.currentUserInfo.userId || attention.indexOf($rootScope.currentUserInfo.userId) > -1;

      } else {
        $scope.onAddNew = true;
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

      $scope.attentionPersons = [];

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
        onFileFactory.getDocumentAttachmentsByDocumentId($scope.document.documentId)
          .success(function(resp) {
            $scope.attachments = $scope.attachments.concat(resp.attachments);
            $scope.attachments = _.map($scope.attachments, function(el) {
              var newEl = el;
              newEl.uploaded = true;
              return newEl;
            });
          })
          .error(function(err) {
            console.log(err);
            $scope.attachments = [];
          });
      }

      var load = function() {

        $scope.priorities = taskFactory.getTaskSeverities();
        companyFactory.search().success(function(resp) {
          $scope.companies = resp.companyList;
        });

        $scope.contacts = [];
        $scope.contactLists = memberList || [];
        $scope.attentionName = '';

        // Make contact list
        $scope.contacts = _.map(memberList, function(el) {
          return {userId: el.userId, name: el.contact.firstName + ' ' + el.contact.lastName};
        });

        $scope.contactNameList = _.map(memberList, function(el) {
          return {userId: el.userId, name: el.contact.firstName + ' ' + el.contact.lastName};
        });

        if(document) {
          // Get receiver name
          if(document.keyValues.receiverId) {
            var receiver = _.find(memberList, {userId: document.keyValues.receiverId});
            if(receiver) {
              $scope.receiverName = receiver.contact.firstName + ' ' + receiver.contact.lastName;
            }

            // remove receiver name from contactNameList
            _.remove($scope.contactNameList, function(contact, idx) {
              return contact.userId === document.keyValues.receiverId;
            });
          }

          // Make attention list
          $scope.attentionPersons = _.map(_.where(document.keyValues.attention, function(el) {
            return _.find(memberList, {userId: el});
          }), function(el) {
            var obj = _.find(memberList, {userId: el});
            return obj;
          });

          //remove contact name from receiver list
          _.remove($scope.contacts, function(contact, idx) {
            return _.contains(document.keyValues.attention, contact.userId);
          });
        }

        if($scope.document.documentId) {
          $scope.responses = responses;

          if(document.createdBy === userContext.authentication().userData.userId && !$scope.onView) {
            $scope.onView = $scope.responses.length > 0;
          }

          loadDocumentAttachments(true);
        }
      };

      $scope.submit = function(form) {
        $scope.document.keyValues.rfi_is_a_change = $scope.document.keyValues.rfi_is_a_change || 'NO';
        var newDocumentFormattedKeyValues = [];
        angular.forEach($scope.document.keyValues, function(value, key) {
          var $this = this;
          if(key === 'attention') {
            _.each(value, function(el, idx) {
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
            "userId": $scope.document.keyValues.receiverId,
            "username": null
          }
        ];

        $scope.newDocument.dueDate = $scope.document.dueDate;

        function done(exp, form) {
          if(exp) {
            $scope.exportPdf().
              then(function() {
                $state.go('app.onFile');
                $scope.onSubmit = false;
                form.$setPristine();
              });
          } else {
            $state.go('app.onFile');
            $scope.onSubmit = false;
            form.$setPristine();
          }
        }

        if($scope.document.documentId) {
          onFileFactory.updateDocument($scope.newDocument)
            .success(function(resp) {
              var promises = [];
              if($scope.attachments.length > 0) {
                _.each($scope.attachments, function(file) {
                  if(!file.uploaded) {
                    promises.push($scope.saveDocumentInfo(file));
                  } else if(file.deleted) {
                    promises.push($scope.deleteAttachment(file));
                  }
                });

                $q.all(promises).then(function(values) {
                  done(true, form);
                }, function(errors) {
                  done(true, form);
                  console.log(errors);
                });
              } else {
                done(true, form);
              }
            })
            .error(function(err) {
              console.log(err);
              $scope.onSubmit = false;
              form.$setPristine();
            });
        }
        else {
          $scope.newDocument.keyValues.push({
            "key": "date_created",
            "value": new Date().toISOString()
          });
          onFileFactory.addNewDocument($scope.newDocument)
            .success(function(resp) {
              $scope.documentId = resp.document.documentId;
              var promises = [];
              if($scope.attachments.length > 0) {
                _.each($scope.attachments, function(file) {
                  if(!file.uploaded) {
                    promises.push($scope.saveDocumentInfo(file));
                  }
                });

                $q.all(promises).then(function(values) {
                  done(false, form);
                }, function(errors) {
                  done(false, form);
                  console.log(errors);
                });
              } else {
                done(false, form);
              }
            })
            .error(function(err) {
              console.log(err);
              $scope.onSubmit = false;
              form.$setPristine();
            });
        }
      };

      $scope.addResponse = function(form) {
        $scope.isAddingResponse = true;
        $scope.onSubmit = true;
        onFileFactory.addResponse($scope.newResponse.response, $scope.document.documentId)
          .success(function(resp) {
            //$state.go('app.onFile');
            var promises = [];
            _.each($scope.newResponse.attachments, function(file) {
              promises.push($scope.saveDocumentInfo(file));
            });

            function done(form) {
              console.log(form);
              $scope.newResponse.response = "";
              $scope.getResponse();
              $scope.newResponse = {};
              form.$setPristine();
              $scope.isAddingResponse = false;
              $scope.onSubmit = false;
              loadDocumentAttachments(true);
            }

            $q.all(promises).then(function(values) {
              done(form);
            }, function(errors) {
              done(form);
            });
          })
          .error(function(err) {
            console.log(err);
            form.$setPristine();
            $scope.isAddingResponse = false;
            $scope.onSubmit = false;
          });
      };

      $scope.getResponse = function() {
        onFileFactory.getResponse($scope.document.documentId)
          .success(function(resp) {
            $scope.responses = resp.documentResponses;

            if(document.createdBy === userContext.authentication().userData.userId && !$scope.onView) {
              $scope.onView = $scope.responses.length > 0;
            }
          })
          .error(function(err) {
            console.log(err);
            $scope.responses = [];
          });
      };

      $scope.getCompanyOfUser = function() {
        var userCompany = _.find($scope.contactLists, function(contact) {
          return contact.userId === $scope.document.keyValues.receiverId;
        });
        $scope.document.keyValues.company_name = userCompany ? userCompany.companyName : '';
        removeUserSelected();
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

      $scope.saveDocumentInfo = function(file) {
        var deferred = $q.defer();
        fileFactory.move(file.filePath, null, 'projects', $rootScope.currentProjectInfo.projectAssetFolderName, 'onfile')
          .success(function(resp) {
            onFileFactory.addAttachment({
              "documentId": $scope.documentId,
              "filePath": resp.url,
              "addedBy": userContext.authentication().userData.userId
            })
              .success(function(resp) {
                deferred.resolve(resp);
              })
              .error(function(error) {
                deferred.reject(error);
              });
          })
          .error(function(error) {
            deferred.reject(error);
          });
        return deferred.promise;
      };

      $scope.deleteAttachment = function(file) {
        return onFileFactory.deleteAttachment(file.documentAttachmentId);
      };

      $scope.exportPdf = function(download) {
        $scope.isExporting = true;
        var deferred = $q.defer();
        var data = {
          document: angular.copy($scope.document),
          projectAssetFolderName: $rootScope.currentProjectInfo.projectAssetFolderName
        };
        data.document.keyValues.receiverName = $scope.receiverName;
        data.document.responseData = $scope.responses;
        data.document.attentionName = $scope.attentionName;
        data.document.keyValues.attention = _.map(data.document.keyValues.attention, function(att) {
          return _.find(memberList, {userId: att});
        });
        data.document.keyValues.receiver = _.find(memberList, {userId: data.document.keyValues.receiverId});
        data.document.creator = _.find(memberList, {userId: data.document.createdBy});
        onFileFactory.exportPdf(data)
          .success(function(resp) {
            if(download) {
              $window.open($filter('fileDownloadPathHash')(resp.filePath));
            }
            $scope.isExporting = false;
            deferred.resolve();
          })
          .error(function(err) {
            $scope.isExporting = false;
            deferred.resolve();
          });
        return deferred.promise;
      };

      //$scope.removeReceiver = function(){
      //  _.remove($scope.contacts, function(contact) {
      //    return contact.userId === document.keyValues.attention;
      //  });
      //};

      $scope.updateReceiverList = function() {
        // Make contact list
        $scope.contacts = _.compact(_.map(memberList, function(el) {
          if(!_.contains($scope.document.keyValues.attention, el.userId)) {
            return {userId: el.userId, name: el.contact.firstName + ' ' + el.contact.lastName};
          }
        }));

        //$scope.document.keyValues.receiverId =

      };

      $scope.changeStatus = function(status) {
        if(status === 'APPROVED' && !$scope.haveApprovePermission) {
          return;
        }
        if(status === 'REJECTED' && !$scope.haveRejectPermission) {
          return;
        }
        $scope.onSubmit = true;
        $scope.onRejecting = status === 'REJECTED';
        $scope.onApproving = status === 'APPROVED';
        onFileFactory.updateStatus($scope.document.documentId, status, userContext.authentication().userData.userId)
          .success(function(resp) {
            $state.go($state.current, {docId: $scope.document.documentId}, {reload: true});
          })
          .error(function(err) {
            $scope.onSubmit = false;
            $scope.onRejecting = false;
            $scope.onApproving = false;
            console.log(err);
          });
      };

      load();

      $scope.openUpdateResponse = function(response) {
        response.onEdit = true;
        response.updateResponse = response.response;
      };

      $scope.updateResponse = function(response) {
        if(response.updateReponse !== '') {
          onFileFactory.updateResponse(response.documentResponseId, response.updateResponse).success(
            function(resp) {
              response.onEdit = false;
              $scope.getResponse();
            }
          );
        }
      };

      var deleteResponseModalInstance;

      $scope.openDeleteModal = function(response) {
        deleteResponseModalInstance = $modal.open({
          templateUrl: 'onFile/templates/deleteResponse.html',
          controller: 'DeleteResponseController',
          size: 'sm',
          resolve: {
            response: function() {
              return response;
            }
          }
        });

        deleteResponseModalInstance.result.then(function() {
          $scope.getResponse();
        }, function() {

        });
      };

      $scope.deleteResponse = function(response) {
        onFileFactory.deleteResponse(response.documentResponseId).success(
          function(resp) {
            $scope.getResponse();
          }
        );
      };

    }];
  return controller;
});
