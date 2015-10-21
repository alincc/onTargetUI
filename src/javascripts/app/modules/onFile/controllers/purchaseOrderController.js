define(function(require) {
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', 'notifications', 'taskFactory', 'onFileFactory', 'companyFactory', 'onContactFactory', 'userContext', '$state', '$modal', '$q', 'fileFactory', '$window', '$filter', 'document',
    function($scope, $rootScope, notifications, taskFactory, onFileFactory, companyFactory, onContactFactory, userContext, $state, $modal, $q, fileFactory, $window, $filter, document) {

      $scope.purchaseOrder = {
        keyValues: {}
      };
      $scope.attachments = [];
      
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

      if(document) {
        getUserAction(document);
        $scope.purchaseOrder = document;
        $scope.purchaseOrder.dueDate = new Date($scope.purchaseOrder.dueDate);
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

      /*{
       "createdBy" : null,
       "createdDate" : null,
       "modifiedBy" : null,
       "modifiedDate" : null,
       "document" : null,
       "key" : "name",
       "value" : "Sebastian Praysis"
       }*/

      var load = function() {
        $scope.priorities = taskFactory.getTaskSeverities();
        $scope.shippingMethods = onFileFactory.getShippingMethod();
        companyFactory.search().success(function(resp) {
          $scope.companies = resp.companyList;
        });

        onContactFactory.getContactList($rootScope.currentProjectInfo.projectId, $rootScope.currentUserInfo.userId).
          success(function(content) {
            var memberList = content.projectMemberList;
            $scope.contacts = [];
            $scope.contactLists = memberList;
            angular.forEach(memberList, function(projectMember, key) {
              var fullName = projectMember.contact.firstName + ' ' + projectMember.contact.lastName;
              $scope.contacts.push({userId: projectMember.userId.toString(), name: fullName});
              if(document && projectMember.userId.toString() === document.keyValues.username) {
                $scope.username = projectMember.contact.firstName + ' ' + projectMember.contact.lastName;
                console.log($scope.username);
              }
            });
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
      };

      $scope.submit = function() {
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
            "userId": $scope.purchaseOrder.keyValues.username,
            "username": null
          }
        ];
        $scope.newDocument.dueDate = $scope.purchaseOrder.dueDate;

        function done(){
          $scope.exportPdf().
            then(function(){
              $state.go('app.onFile');
              $scope.onSubmit = false;
              $scope._form.$setPristine();
            });
        }

        if($scope.purchaseOrder.documentId) {
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
                done();
              }, function(errors) {
                done();
                console.log(errors);
              });
            } else {
              $scope.onSubmit = false;
              $state.go('app.onFile');
            }
          }).error(function(err) {
              console.log(err);
              $scope.onSubmit = false;
            }).finally(function() {
              $scope._form.$setPristine();
            });
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
                done();
              }, function(errors) {
                console.log(errors);
                done();
              });
            } else {
              $scope.onSubmit = false;
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
        $scope.purchaseOrder.keyValues.company_name = _.result(_.find($scope.contactLists, function(contact) {
          return contact.userId.toString() === $scope.purchaseOrder.keyValues.username;
        }), 'companyName');
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
        onFileFactory.exportPdf(data)
          .success(function(resp) {
            if(download){
              $window.open($filter('fileDownloadPathHash')(resp.filePath));
            }
            deferred.resolve();
          })
          .error(function(err) {
            deferred.resolve();
          });
        return deferred.promise;
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
