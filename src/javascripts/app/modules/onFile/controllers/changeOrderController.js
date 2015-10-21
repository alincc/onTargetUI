define(function (require) {
  'use strict';
  var angular = require('angular');

  var controller = ['$scope', '$rootScope', 'notifications', 'taskFactory', 'onFileFactory', 'companyFactory', 'onContactFactory', 'userContext', 'fileFactory', '$timeout', '$state', '$modal', '$q', '$window', '$filter', 'document',
    function($scope, $rootScope, notifications, taskFactory, onFileFactory, companyFactory, onContactFactory, userContext, fileFactory, $timeout, $state, $modal, $q, $window, $filter, document) {

      $scope.changeOrder = {
        keyValues: {}
      };
      $scope.costGrid = [];

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

      if (document) {
        getUserAction(document);
        $scope.changeOrder = document;
        $scope.changeOrder.dueDate = new Date($scope.changeOrder.dueDate);
        $scope.submittal = document.submittal;
        $scope.approval = document.approval;
        $scope.costGrid = document.gridKeyValues;
      } else {
        $scope.onEdit = true;
      }
      
      console.log($scope);

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

      $scope.dateCreated = {
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

      $scope.newDocument = {
        "projectId": $rootScope.currentProjectInfo.projectId,
        "documentTemplateId": documentTemplate.CO.document_template_id,
        "documentName": documentTemplate.CO.documentName,
        "documentId": $scope.changeOrder.documentId || null,
        "dueDate": '',
        "keyValues": [],
        "gridKeyValues": [],
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

      $scope.addCostGrid = function() {
        var cost = {
          workDescription: '',
          costCode: '',
          amount: ''
        };
        if ($scope.costGrid.length < 50) {
          $scope.costGrid.push(cost);
        }
      };

      $scope.removeCostGrid = function (index) {
        if ($scope.costGrid.length > 1) {
          $scope.costGrid.splice(index, 1);
        }
      };

      var load = function () {
        $scope.priorities = taskFactory.getTaskSeverities();
        $scope.shippingMethods = onFileFactory.getShippingMethod();
        $scope.disciplines = onFileFactory.getDisciplines();
        $scope.categories = onFileFactory.getCategories();
        $scope.scheduleImpacts = onFileFactory.getImpacts();
        $scope.costImpacts = onFileFactory.getImpacts();
        companyFactory.search().success(function (resp) {
          $scope.companies = resp.companyList;
        });

        onContactFactory.getContactList($rootScope.currentProjectInfo.projectId, $rootScope.currentUserInfo.userId).
          success(function (content) {
            var memberList = content.projectMemberList;
            $scope.contactLists = memberList;
            $scope.contacts = [];
            angular.forEach(memberList, function (projectMember, key) {
              var fullName = projectMember.contact.firstName + ' ' + projectMember.contact.lastName;
              $scope.contacts.push({userId: projectMember.userId.toString(), name: fullName});
              if(document && projectMember.userId.toString() === document.keyValues.username) {
                $scope.username = projectMember.contact.firstName + ' ' + projectMember.contact.lastName;
                console.log($scope.username);
              }
            });
          });

        if (!$scope.changeOrder.documentId) {
          $scope.addCostGrid();
        }

        if ($scope.changeOrder.documentId) {
          onFileFactory.getDocumentAttachmentsByDocumentId($scope.changeOrder.documentId).success(
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
      };

      $scope.submit = function () {
        $scope.onSubmit = true;
        var newDocumentFormattedKeyValues = [];
        angular.forEach($scope.changeOrder.keyValues, function (value, key) {
          var keyValuePair = {
            "key": key,
            "value": value
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
            "userId": $scope.changeOrder.keyValues.username,
            "username": null
          }
        ];

        function done() {
          $scope.exportPdf().
            then(function() {
              $state.go('app.onFile');
              $scope.onSubmit = false;
              $scope._form.$setPristine();
            });
        }

        if($scope.changeOrder.documentId) {
          onFileFactory.updateDocument($scope.newDocument).success(function(resp) {
            $scope.documentId = resp.document.documentId;
            var promises = [];
            if ($scope.attachments.length > 0) {
              _.each($scope.attachments, function (file) {
                if (!file.uploaded) {
                  promises.push(saveDocumentInfo(file));
                }
              });

              $q.all(promises).then(function(values) {
                done();
              }, function(errors) {
                $scope.exportPdf().
                  done();
                console.log(errors);
              });
            } else {
              $state.go('app.onFile');
              $scope.onSubmit = false;
              $scope._form.$setPristine();
            }
          }).error(function(err) {
            console.log(err);
            $scope.onSubmit = false;
            $scope._form.$setPristine();
          }).finally(
            function () {
              $scope.onSubmit = false;
              $scope._form.$setPristine();
            }
          );
        }
        else {
          onFileFactory.addNewDocument($scope.newDocument).success(function(resp) {
            $scope.documentId = resp.document.documentId;
            var promises = [];
            if ($scope.attachments.length > 0) {
              _.each($scope.attachments, function (file) {
                if (!file.uploaded) {
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
            function () {
              $scope.onSubmit = false;
              $scope._form.$setPristine();
            }
          );
        }
      };

      /* var addAttachment = function (file){
       var deferred = $q.defer();
       onFileFactory.addAttachment({
       "documentId" : $scope.documentId,
       "filePath" : file.filePath,
       "addedBy" : userContext.authentication().userData.userId
       }).success(
       function (resp){
       deferred.resolve(resp);
       }).error(function (error){
       deferred.reject(error);
       });
       return deferred.promise;
       };*/

      $scope.updateStatus = function (status) {
        $scope.onSubmit = true;
        onFileFactory.updateStatus($scope.changeOrder.documentId, status, userContext.authentication().userData.userId)
          .success(function (resp) {
            $scope.onSubmit = false;
            $state.go('app.onFile');
          })
          .error(
          function (err) {
            $scope.onSubmit = false;
          });
      };

      /*$scope.exportPdf = function () {
        var data = angular.copy($scope.changeOrder);
        data.keyValues.username = $scope.username;
        onFileFactory.exportPdf(data).then(function (resp) {

        });
      };*/

      $scope.getCompanyOfUser = function () {
        $scope.changeOrder.keyValues.company_name = '';
        $scope.changeOrder.keyValues.company_name = _.result(_.find($scope.contactLists, function (contact) {
          return contact.userId.toString() === $scope.changeOrder.keyValues.username;
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
          document: angular.copy($scope.changeOrder),
          projectAssetFolderName: $rootScope.currentProjectInfo.projectAssetFolderName
        };
        data.document.keyValues.username = $scope.username;
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

      var saveDocumentInfo = function (file) {
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

      load();

    }];
  return controller;
});
