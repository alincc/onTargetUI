define(function(require) {
  'use strict';
  var angular = require('angular');
  var controller = [
    '$scope',
    '$rootScope',
    'notifications',
    'taskFactory',
    'onFileFactory',
    'companyFactory',
    'onContactFactory',
    'userContext',
    '$state',
    '$modal',
    '$q',
    'fileFactory',
    '$window',
    '$filter',
    'document',
    function($scope,
             $rootScope,
             notifications,
             taskFactory,
             onFileFactory,
             companyFactory,
             onContactFactory,
             userContext,
             $state,
             $modal,
             $q,
             fileFactory,
             $window,
             $filter,
             document) {

      $scope.purchaseOrder = {
        keyValues: {}
      };
      $scope.attachments = [];
      $scope.isExporting = false;

      $scope.document = document;


      console.log('document', document);

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
        $scope.purchaseOrder = document;
        $scope.documentId = document.documentId;
        $scope.purchaseOrder.dueDate = new Date($scope.purchaseOrder.dueDate);
        $scope.submittal = document.submittal;
        $scope.approval = document.approval;
        console.log($scope.purchaseOrder);
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
      $scope.attachment = {
        file: null
      };

      var documentTemplate = onFileFactory.getDocumentTemplateId();

      $scope.newDocument = {
        "projectId": $rootScope.currentProjectInfo.projectId,
        "documentTemplateId": documentTemplate.PO.document_template_id,
        "documentName": documentTemplate.PO.documentName,
        "documentId": $scope.purchaseOrder.documentId || '',
        "dueDate": '',
        "keyValues": [],
        "submittedBy": userContext.authentication().userData.userId
      };

      var load = function() {
        $scope.priorities = taskFactory.getTaskSeverities();
        $scope.shippingMethods = onFileFactory.getShippingMethod();
        companyFactory.search().success(function(resp) {
          $scope.companies = resp.companyList;
          console.log($scope.companies);
        });

        onContactFactory.getContactList($rootScope.currentProjectInfo.projectId, $rootScope.currentUserInfo.userId).
          success(function(content) {
            var memberList = content.projectMemberList;
            $scope.contactLists = memberList;

            $scope.contacts = _.map(memberList, function(el) {
              return {userId: el.userId, name: el.contact.firstName + ' ' + el.contact.lastName};
            });

            if(document) {
              var receiver = _.find(memberList, {userId: document.keyValues.receiverId});
              if(receiver) {
                $scope.receiverName = receiver.contact.firstName + ' ' + receiver.contact.lastName;
              }

              var shipReceiver = _.find(memberList, {userId: parseInt(document.keyValues.ship_to_name)});
              if(shipReceiver) {
                $scope.ship_to_name = shipReceiver.contact.firstName + ' ' + shipReceiver.contact.lastName;
              }
            }
          });

        if($scope.purchaseOrder.documentId) {
          onFileFactory.getDocumentAttachmentsByDocumentId($scope.purchaseOrder.documentId).success(
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

        if($scope.onEdit){
          $scope.document.keyValues.priority = parseInt($scope.document.keyValues.priority);
        }
      };

      $scope.submit = function(form) {
        $scope.purchaseOrder.dueDate = $filter('datetime')($scope.purchaseOrder.dueDate);

        var newDocumentFormattedKeyValues = [];
        angular.forEach($scope.purchaseOrder.keyValues, function(value, key) {
          var keyValuePair = {
            "key": key,
            "value": value,
            "createdBy": $scope.newDocument.submittedBy,
            "createdDate": new Date()
          };
          this.push(keyValuePair);
        }, newDocumentFormattedKeyValues);
        $scope.newDocument.keyValues = newDocumentFormattedKeyValues;
        $scope.newDocument.assignees = [
          {
            "userId": $scope.purchaseOrder.keyValues.receiverId,
            "username": null
          }
        ];
        $scope.newDocument.dueDate = $scope.purchaseOrder.dueDate;

        function done(exp, form) {
          if(exp) {
            $scope.exportPdf().
              then(function() {
                $state.go('app.onFile');
                $scope.onSubmit = false;
                form.$setPristine();
              });
          }
          else {
            $state.go('app.onFile');
            $scope.onSubmit = false;
            form.$setPristine();
          }
        }

        if($scope.purchaseOrder.documentId) {
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
                done(true, form);
                console.log(errors);
              });
            } else {
              done(true, form);
            }
          }).error(function(err) {
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
                console.log(errors);
                done(false, form);
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
        onFileFactory.updateStatus($scope.purchaseOrder.documentId, status, userContext.authentication().userData.userId)
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
          return contact.userId === $scope.purchaseOrder.keyValues.receiverId;
        });
        $scope.purchaseOrder.keyValues.company_name = userCompany ? userCompany.companyName : '';
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
          document: angular.copy($scope.purchaseOrder),
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
