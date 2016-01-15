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
    'fileFactory',
    '$timeout',
    '$state',
    '$modal',
    '$q',
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
             fileFactory,
             $timeout,
             $state,
             $modal,
             $q,
             $window,
             $filter,
             document) {

      $scope.changeOrder = {
        keyValues: {}
      };
      $scope.costGrid = [];
      $scope.isExporting = false;

      $scope.attachments = [];

      $scope.document = document;

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


      console.log('document: ', document);

      if(document) {
        getUserAction(document);
        $scope.documentId = document.documentId;
        $scope.changeOrder = document;
        $scope.changeOrder.dueDate = new Date($scope.changeOrder.dueDate);
        $scope.submittal = document.submittal;
        $scope.approval = document.approval;
        $scope.costGrid = document.gridKeyValues;
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

      $scope.dateCreated = {
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
        "documentTemplateId": documentTemplate.CO.document_template_id,
        "documentName": documentTemplate.CO.documentName,
        "documentId": $scope.changeOrder.documentId || '',
        "dueDate": '',
        "keyValues": [],
        "gridKeyValues": [],
        "submittedBy": userContext.authentication().userData.userId
      };

      $scope.addCostGrid = function() {
        var cost = {
          workDescription: '',
          costCode: '',
          amount: 0
        };
        if($scope.costGrid.length < 50) {
          $scope.costGrid.push(cost);
        }
      };

      $scope.removeCostGrid = function(index) {
        if($scope.costGrid.length > 1) {
          $scope.costGrid.splice(index, 1);
        }
      };

      var load = function() {
        $scope.priorities = taskFactory.getTaskSeverities();
        $scope.shippingMethods = onFileFactory.getShippingMethod();
        $scope.disciplines = onFileFactory.getDisciplines();
        $scope.categories = onFileFactory.getCategories();
        $scope.scheduleImpacts = onFileFactory.getImpacts();
        $scope.costImpacts = onFileFactory.getImpacts();
        companyFactory.search().success(function(resp) {
          $scope.companies = resp.companyList;
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
            }
          });

        if(!$scope.changeOrder.documentId) {
          $scope.addCostGrid();
        }

        if($scope.changeOrder.documentId) {
          onFileFactory.getDocumentAttachmentsByDocumentId($scope.changeOrder.documentId).success(
            function(resp) {
              $scope.attachments = $scope.attachments.concat(resp.attachments);
              $scope.attachments = _.map($scope.attachments, function(el) {
                var newEl = el;
                newEl.uploaded = true;
                newEl.isImage = /(jpg|jpeg|png|bmp)$/i.test(newEl.filePath);
                return newEl;
              });
            }
          );
        }

        if($scope.onView){
          $scope.total = _.sum(document.gridKeyValues, function(n){
            return n.amount;
          });
        }

        if($scope.onEdit){
          $scope.document.keyValues.priority = parseInt($scope.document.keyValues.priority);
        }
      };

      $scope.submit = function(form) {
        $scope.changeOrder.dueDate = $filter('datetime')($scope.changeOrder.dueDate);
        $scope.changeOrder.keyValues.date_created = $filter('datetime')($scope.changeOrder.keyValues.date_created);

        $scope.onSubmit = true;
        var newDocumentFormattedKeyValues = [];
        angular.forEach($scope.changeOrder.keyValues, function(value, key) {
          var keyValuePair = {
            "key": key,
            "value": value
          };
          this.push(keyValuePair);
        }, newDocumentFormattedKeyValues);
        $scope.newDocument.keyValues = newDocumentFormattedKeyValues;
        $scope.newDocument.dueDate = $scope.changeOrder.dueDate;

        var gridKeyValues = [];
        for(var i = 0; i < $scope.costGrid.length; i++) {
          var costGridRow = $scope.costGrid[i];
          var gridKeyValue = {};
          var keys = ["workDescription", "costCode", "amount"];
          var rowValid = true;
          for(var j = 0; j < keys.length; j++) {
            if(!costGridRow[keys[j]]) {
              rowValid = false;
              break;
            }
          }
          if(rowValid) {
            gridKeyValue.gridRowIndex = i;
            for(var k = 0; k < keys.length; k++) {
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
            "userId": $scope.changeOrder.keyValues.receiverId,
            "username": null
          }
        ];

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

        if($scope.changeOrder.documentId) {
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
        onFileFactory.updateStatus($scope.changeOrder.documentId, status, userContext.authentication().userData.userId)
          .success(function(resp) {
            $scope.onSubmit = false;
            $state.go('app.onFile');
          })
          .error(
          function(err) {
            $scope.onSubmit = false;
          });
      };

      $scope.getCompanyOfUser = function() {
        var userCompany = _.find($scope.contactLists, function(contact) {
          return contact.userId === $scope.changeOrder.keyValues.receiverId;
        });
        $scope.changeOrder.keyValues.company_name = userCompany ? userCompany.companyName : '';
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
        $scope.isExporting = true;
        var data = {
          document: angular.copy($scope.changeOrder),
          projectAssetFolderName: $rootScope.currentProjectInfo.projectAssetFolderName
        };
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

      $scope.$watch('costGrid', function() {
        $scope.changeOrder.keyValues.amount = 0;
        _.each($scope.costGrid, function(el) {
          try {
            $scope.changeOrder.keyValues.amount += parseInt(el.amount);
          }
          catch(err) {

          }
        });
      }, true);

      load();

    }];
  return controller;
});
