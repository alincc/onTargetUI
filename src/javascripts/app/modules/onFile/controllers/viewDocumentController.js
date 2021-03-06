define(function(require) {
  'use strict';
  var angular = require('angular'),
    moment = require('moment');
  var controller = ['$scope', '$rootScope', 'notifications', 'onFileFactory', 'userContext', 'documentFactory', 'appConstant', '$state', 'permissionFactory', 'NgTableParams', '$filter',
    function($scope, $rootScope, notifications, onFileFactory, userContext, documentFactory, appConstant, $state, permissionFactory, NgTableParams, $filter) {

      $scope.app = appConstant.app;
      $scope.isLoading = true;
      $scope.approvals = [];
      $scope.submittals = [];
      $scope.attentionsDocs = [];
      $scope.statuses = [
        {
          id: '',
          title: 'Any'
        },
        {
          id: 'APPROVED',
          title: 'APPROVED'
        },
        {
          id: 'SUBMITTED',
          title: 'SUBMITTED'
        },
        {
          id: 'REJECTED',
          title: 'REJECTED'
        }
      ];

      var textFilter = function(data, f, fO) {
          return _.filter(data, function(el) {
            return el[f].indexOf(fO[f]) > -1;
          });
        },
        dateFilter = function(data, f, fO) {
          return _.filter(data, function(el) {
            return moment(el[f]).isValid() && moment(fO[f]).isValid() && moment(el[f]).diff(fO[f], 'day') === 0;
          });
        },
        cols = function(type) {
          return [
            {field: "type", title: "Type", show: true, filter: {type: "text"}},
            {
              field: "documentNumber",
              title: "Document number",
              sortable: "documentNumber",
              filter: {documentNumber: "text"},
              show: true
            },
            {field: "subject", title: "Subject", sortable: "subject", filter: {subject: "text"}, show: true},
            {
              field: "dueDate",
              title: "Due date",
              sortable: "dueDate",
              class: "date",
              show: true,
              filter: {dueDate: "onFile/templates/" + (type === 'all' ? 'allDueDateFilter' : type === 'approval' ? 'approvalDueDateFilter' : 'submittalDueDateFilter') + ".html"}
            },
            {
              field: "status",
              title: "Status",
              sortable: "status",
              filter: {status: "select"},
              filterData: $scope.statuses,
              show: true
            },
            {
              field: "submittedBy",
              title: "Submitted by",
              sortable: "submittedBy",
              filter: {submittedBy: "text"},
              show: type === 'all' || type === 'approval'
            },
            {
              field: "submittedToStr",
              title: "Submitted to",
              show: type === 'all' || type === 'submittal',
              filter: {submittedToStr: "text"}
            },
            {field: "action", title: "Action", show: true},
            {field: "createdDate", title: "Created date", show: false}
          ];
        },
        filterFn = function(params, data) {
          var sortKey = params.orderBy()[0],
            filterObj = params.filter(),
            filteredData = angular.copy(data),
            sortDir = sortKey ? /^\-/.test(sortKey) ? 'desc' : 'asc' : '';
          // Filtering
          if(filterObj) {
            for(var f in filterObj) {
              if(filterObj.hasOwnProperty(f)) {
                if(angular.isString(filterObj[f]) && filterObj[f].length > 0) {
                  // String filter
                  filteredData = textFilter(filteredData, f, filterObj); // Happy JSHint
                }
                else if(angular.isDate(filterObj[f])) {
                  // Date filter
                  filteredData = dateFilter(filteredData, f, filterObj); // Happy JSHint
                }
              }
            }
          }

          // Sorting
          if(sortKey && sortDir) {
            filteredData = _.sortBy(filteredData, sortKey.substring(1, sortKey.length));
            if(sortDir === 'desc') {
              filteredData = filteredData.reverse();
            }
          }

          params.total(filteredData.length);
          return filteredData.slice((params.page() - 1) * params.count(), params.page() * params.count());
        };

      var transformKeyValues = function(keyValues) {
        var newKeyValues = {};
        for(var i = 0; i < keyValues.length; i++) {
          var keyValue = keyValues[i];
          var key = keyValue.key;
          var value = keyValue.value;
          if(keyValue.key === 'date_created' || keyValue.key === 'date' || keyValue.key === 'received_by_date' || keyValue.key === 'sent_by_date' || keyValue.key === 'due_by_date') {
            value = new Date(value);
          }
          newKeyValues[key] = value;
        }
        return newKeyValues;
      };

      var transformGridKeyValues = function(gridKeyValues) {
        var newGridKeyValues = [];
        for(var i = 0; i < gridKeyValues.length; i++) {
          var grid = gridKeyValues[i];
          if(newGridKeyValues[grid.gridRowIndex] === undefined) {
            newGridKeyValues[grid.gridRowIndex] = {};
            /*{
             "value": grid.value,
             "key": grid.key
             }*/
            var key = grid.key;
            var value = grid.value;
            newGridKeyValues[grid.gridRowIndex][key] = value;
          } else {
            /*newGridKeyValues[grid.gridRowIndex].push({
             "value": grid.value,
             "key": grid.key
             });*/
            newGridKeyValues[grid.gridRowIndex][grid.key] = grid.value;
          }
        }

        return newGridKeyValues;
      };

      $scope.onSite = {
        all: {
          cols: cols('all'),
          tableParams: new NgTableParams({
            // initial sort order
            sorting: {
              createdDate: "desc"
            },
            filter: {
              status: ''
            },
            page: 1,
            count: 20
          }, {
            counts: [],
            getData: function($defer, params) {
              return filterFn(params, $scope.all);
            }
          })
        },
        submittal: {
          cols: cols('submittal'),
          tableParams: new NgTableParams({
            // initial sort order
            sorting: {
              createdDate: "desc"
            },
            filter: {
              status: ''
            },
            page: 1,
            count: 20
          }, {
            counts: [],
            getData: function($defer, params) {
              return filterFn(params, $scope.submittals);
            }
          })
        },
        approval: {
          cols: cols('approval'),
          tableParams: new NgTableParams({
            // initial sort order
            sorting: {
              createdDate: "desc"
            },
            filter: {
              status: ''
            },
            page: 1,
            count: 20
          }, {
            counts: [],
            getData: function($defer, params) {
              return filterFn(params, $scope.approvals);
            }
          })
        }
      };

      $scope.prepareViewData = function(approvals, submittals, attentionsDocs) {

        var mapData = function(newEl) {
          newEl.submittedBy = newEl.creator.contact.firstName + ' ' + newEl.creator.contact.lastName;
          newEl.subject = _.pluck(_.where(newEl.keyValues, {key: 'subject'}), 'value')[0];
          newEl.documentNumber = $filter('documentNumber')(newEl);
          newEl.type = newEl.documentTemplate.name;
          newEl.submittedToStr = _.map(newEl.submittedTo, function(el) {
            return el.contact.firstName + ' ' + el.contact.lastName;
          }).join(', ');
          return newEl;
        };

        approvals = _.map(approvals, function(el) {
          var newEl = el;
          if(newEl.status === 'SUBMITTED') {
            newEl.approve = true;
          } else {
            newEl.view = true;
          }
          return mapData(newEl);
        });

        submittals = _.map(submittals, function(el) {
          var newEl = el;
          if(newEl.status === 'SUBMITTED') {
            newEl.edit = true;
          } else {
            newEl.view = true;
          }
          return mapData(newEl);
        });

        attentionsDocs = _.map(attentionsDocs, function(el) {
          var newEl = el;
          newEl.view = true;
          return mapData(newEl);
        });

        $scope.approvals = approvals.reverse();

        $scope.submittals = submittals.reverse();

        $scope.attentionsDocs = attentionsDocs.reverse();

        $scope.all = _.sortBy(_.uniq([].concat($scope.approvals, $scope.submittals, $scope.attentionsDocs), 'documentId'), 'createdDate').reverse();
        $scope.onSite.all.tableParams.reload();
        $scope.onSite.approval.tableParams.reload();
        $scope.onSite.submittal.tableParams.reload();
      };

      documentFactory.getUserDocument($rootScope.currentProjectInfo.projectId)
        .success(function(resp) {
          $scope.prepareViewData(resp.approvals, resp.submittals, resp.attentionsDocs);

          $scope.isLoading = false;
        })
        .error(function(err) {
          console.log(err);
          $scope.isLoading = false;
        });

      $scope.viewDocument = function(doc) {
        onFileFactory.getDocumentById(doc.documentId).success(
          function(resp) {
            var document = resp.document;
            //var document = doc;

            var keyValues = transformKeyValues(document.keyValues);
            if(document.gridKeyValues && document.gridKeyValues.length > 0) {
              document.gridKeyValues = transformGridKeyValues(document.gridKeyValues);
            }

            document.keyValues = keyValues;
            /*if(status === 'submittal') {
             document.submittal = true;
             } else if (status === 'approval') {
             document.approval = true;
             }*/
            document.approve = doc.status === 'APPROVED';
            document.edit = doc.edit;
            document.view = doc.view;

            $rootScope.onFileDocument = document;
            notifications.documentSelected();
          }
        );
      };

      $scope.previewDocument = function(doc) {
        switch(doc.documentTemplate.documentTemplateId) {
          case 1:
            $state.go('app.onFile.PO', {docId: doc.documentId});
            break;
          case 2:
            $state.go('app.onFile.CO', {docId: doc.documentId});
            break;
          case 3:
            $state.go('app.onFile.RIF', {docId: doc.documentId});
            break;
          case 4:
            $state.go('app.onFile.Trans', {docId: doc.documentId});
            break;
          default :
            $scope.action = $scope.actions.viewDocument;
            break;
        }
      };

      $scope.haveApprovePermission = permissionFactory.checkFeaturePermission('ONFILE_APPROVE');
      $scope.haveRejectPermission = permissionFactory.checkFeaturePermission('ONFILE_REJECT');
      $scope.haveViewPermission = permissionFactory.checkFeaturePermission('ONFILE_VIEW');
      $scope.updateApproveInformation = function(doc, cb) {
        onFileFactory.getDocumentById(doc.documentId)
          .success(function(resp) {
            var keyValues = resp.document.keyValues;
            var receiver = _.find(keyValues, {'key': 'receiverId'});
            var approveRejectDate = _.find(keyValues, {'key': 'approveRejectDate'});
            if(!approveRejectDate) {
              keyValues.push({
                'key': 'approveRejectDate',
                'value': new Date().toISOString()
              });
            }
            if(receiver) {
              onFileFactory.updateDocument({
                "projectId": resp.document.projectId,
                "documentTemplateId": resp.document.documentTemplate.documentTemplateId,
                "documentName": resp.document.documentTemplate.name,
                "documentId": resp.document.documentId,
                "dueDate": resp.document.dueDate,
                "keyValues": keyValues,
                "submittedBy": resp.document.createdBy,
                "assignees": [{"userId": receiver.value}]
              })
                .success(function(resp) {
                  cb();
                })
                .error(function(err) {
                  cb();
                });
            } else {
              cb();
            }
          })
          .error(function() {
            cb();
          });

      };
      $scope.changeStatus = function(doc, status, $event, idx) {
        $event.stopImmediatePropagation();
        if(status === 'APPROVED' && !$scope.haveApprovePermission) {
          return;
        }
        if(status === 'REJECTED' && !$scope.haveRejectPermission) {
          return;
        }
        doc.isApproveReject = true;
        onFileFactory.updateStatus(doc.documentId, status, userContext.authentication().userData.userId)
          .success(function(resp) {
            $scope.updateApproveInformation(doc, function() {
              doc.approve = false;
              doc.status = status;
              doc.view = true;
              doc.isApproveReject = false;
              //change status success
              _.remove($scope.approvals, {documentId: doc.documentId});
              _.remove($scope.all, {documentId: doc.documentId});
            });
          })
          .error(function() {
            doc.isApproveReject = false;
          });
      };

      $scope.deleteDoc = function(doc, $event) {
        $event.stopImmediatePropagation();
      };

    }];
  return controller;
});
