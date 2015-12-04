define(function(require) {
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', 'notifications', 'taskFactory', 'onFileFactory', 'companyFactory', 'onContactFactory', 'userContext', '$state', '$q', '$modal', 'fileFactory', '$window', '$filter', 'document',
    function($scope, $rootScope, notifications, taskFactory, onFileFactory, companyFactory, onContactFactory, userContext, $state, $q, $modal, fileFactory, $window, $filter, document) {

      $scope.document = {
        keyValues: {}
      };
      $scope.attachments = [];
      $scope.isExporting = false;

      //user action : view, edit, create, approve
      var getUserAction = function(document) {
        if(document.createdBy === userContext.authentication().userData.userId) {
          if(document.status === 'SUBMITTED') {
            $scope.onEdit = true;
          } else {
            $scope.onView = true;
          }
        } else {
          if(document.status === 'SUBMITTED') {
            $scope.onApprove = true;
          } else {
            $scope.onView = true;
          }
        }
      };

      if(document) {
        getUserAction(document);
        $scope.document = document;
        $scope.documentId = document.documentId;
        $scope.document.dueDate = new Date($scope.document.dueDate);
        $scope.submittal = document.submittal;
        $scope.approval = document.approval;
      } else {
        $scope.onEdit = true;
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
        "submittedBy": userContext.authentication().userData.userId
      };

      var load = function() {
        companyFactory.search().success(function(resp) {
          $scope.companies = resp.companyList;
        });
        onContactFactory.getContactList($rootScope.currentProjectInfo.projectId, $rootScope.currentUserInfo.userId).
          success(function(content) {
            var memberList = content.projectMemberList;
            $scope.contactLists = memberList || [];
            $scope.contacts = _.map(memberList, function(el) {
              return {userId: el.userId, name: el.contact.firstName + ' ' + el.contact.lastName};
            });

            if(document) {
              var receiver = _.find(memberList, {userId: document.keyValues.receiverId});
              if(receiver) {
                $scope.receiverName = receiver.contact.firstName + ' ' + receiver.contact.lastName;
              }
            }
          });
        $scope.items = onFileFactory.getItems();
        $scope.submittedFors = onFileFactory.getSubmittedFor();
        $scope.actionsAsNoted = onFileFactory.getActionAsNoted();
        var i = 0;
        for(i = 0; i < $scope.submittedFors.length; i++) {
          $scope.submittedFors[i].value = $scope.document.keyValues[$scope.submittedFors[i].key] || 'NO';
        }
        for(i = 0; i < $scope.actionsAsNoted.length; i++) {
          $scope.actionsAsNoted[i].value = $scope.document.keyValues[$scope.actionsAsNoted[i].key] || 'NO';
        }

        if($scope.document.documentId) {
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
      };

      $scope.submit = function(form) {
        var newDocumentFormattedKeyValues = [];
        angular.forEach($scope.document.keyValues, function(value, key) {
          var keyValuePair =
          {
            "key": key,
            "value": value
          };
          this.push(keyValuePair);
        }, newDocumentFormattedKeyValues);
        $scope.newDocument.keyValues = newDocumentFormattedKeyValues;
        $scope.newDocument.keyValues = $scope.newDocument.keyValues.concat($scope.submittedFors);
        $scope.newDocument.keyValues = $scope.newDocument.keyValues.concat($scope.actionsAsNoted);
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
          onFileFactory.updateDocument($scope.newDocument).success(function(resp) {
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
                console.log(errors);
                done(true, form);
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
          onFileFactory.addNewDocument($scope.newDocument).success(function(resp) {
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
        var userCompany = _.find($scope.contactLists, function(contact) {
          return contact.userId === $scope.document.keyValues.receiverId;
        });
        $scope.document.keyValues.company_name = userCompany ? userCompany.companyName : '';
        $scope.document.keyValues.company_id = userCompany ? userCompany.companyId : '';
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
          $scope.attachments = $scope.attachments.concat(data.result);
        }, function() {

        });
      };

      $scope.exportPdf = function(download) {
        var deferred = $q.defer();
        var data = {
          document: angular.copy($scope.document),
          projectAssetFolderName: $rootScope.currentProjectInfo.projectAssetFolderName
        };
        $scope.isExporting = true;
        data.document.keyValues.receiverName = $scope.receiverName;
        data.document.keyValues.receiver = _.find($scope.contactLists, {userId: data.document.keyValues.receiverId});
        data.document.creator = _.find($scope.contactLists, {userId: data.document.createdBy});
        onFileFactory.exportPdf(data)
          .success(function(resp) {
            if(download) {
              $window.open($filter('fileDownloadPathHash')(resp.filePath));
            }
            deferred.resolve();
            $scope.isExporting = false;
          })
          .error(function(err) {
            deferred.resolve();
            $scope.isExporting = false;
          });
        return deferred.promise;
      };

      $scope.saveDocumentInfo = function(file) {
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

      $scope.deleteAttachment = function(file) {
        return onFileFactory.deleteAttachment(file.documentAttachmentId);
      };

      load();

    }];
  return controller;
});
