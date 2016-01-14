define(function(require) {
  'use strict';
  var angular = require('angular'),
    uiRouter = require('uiRouter'),
    template = require('text!./templates/onFile.html'),
    purchaseOrderTemplate = require('text!./templates/purchaseOrder.html'),
    purchaseOrderViewTemplate = require('text!./templates/purchaseOrderView.html'),
    changeOrderTemplate = require('text!./templates/changeOrder.html'),
    changeOrderViewTemplate = require('text!./templates/changeOrderView.html'),
    viewDocumentTemplate = require('text!./templates/viewDocument.html'),
    requestForInformationTemplate = require('text!./templates/requestForInformation.html'),
    requestForInformationViewTemplate = require('text!./templates/requestForInformationView.html'),
    transmittalTemplate = require('text!./templates/transmittal.html'),
    transmittalViewTemplate = require('text!./templates/transmittalView.html'),
    uploadTemplate = require('text!./templates/upload.html'),
    deleteReponseTemplate = require('text!./templates/deleteResponse.html'),
    attachmentListTemplate = require('text!./templates/attachmentList.html'),
    pdfAttachmentListTemplate = require('text!./templates/pdfAttachmentList.html'),
    allDueDateFilterTpl = require('text!./templates/allDueDateFilter.html'),
    submittalDueDateFilterTpl = require('text!./templates/submittalDueDateFilter.html'),
    approvalDueDateFilterTpl = require('text!./templates/approvalDueDateFilter.html'),
    attachmentListDirective = require('./directives/attachmentList'),
    pdfAttachmentListDirective = require('./directives/pdfAttachmentList'),
    controller = require('./controllers/onFileController'),
    purchaseOrderController = require('./controllers/purchaseOrderController'),
    changeOrderController = require('./controllers/changeOrderController'),
    viewDocumentController = require('./controllers/viewDocumentController'),
    requestForInformationController = require('./controllers/requestForInformationController'),
    transmittalController = require('./controllers/transmittalController'),
    uploadController = require('./controllers/upload'),
    deleteResponseController = require('./controllers/deleteResponse'),
    projectContextModule = require('app/common/context/project'),
    permissionServiceModule = require('app/common/services/permission'),
    notification = require('app/common/services/notifications'),
    taskServiceModule = require('app/common/services/task'),
    onFileServiceModule = require('app/common/services/onFile'),
    companyServiceModule = require('app/common/services/company'),
    contactServiceModule = require('app/common/services/onContact'),
    userServiceModule = require('app/common/services/user'),
    fileServiceModule = require('app/common/services/file'),
    uploadBoxModule = require('app/common/directives/uploadBox/uploadBox'),
    userContext = require('app/common/context/user'),
    documentServiceModule = require('app/common/services/document'),
    angularUiSelect = require('angularUiSelect'),
    ngTable = require('ngTable');
  var module = angular.module('app.onFile', [
    'ui.router',
    'app.config',
    'common.context.project',
    'common.services.permission',
    'common.services.notifications',
    'common.services.task',
    'common.services.onFile',
    'common.services.company',
    'common.services.onContact',
    'common.services.file',
    'common.services.document',
    'ui.select',
    'common.directives.uploadBox',
    'ngTable'
  ]);

  module.run([
    '$templateCache', function($templateCache) {
      $templateCache.put('onFile/templates/onFile.html', template);
      $templateCache.put('purchaseOrder/templates/purchaseOrder.html', purchaseOrderTemplate);
      $templateCache.put('purchaseOrder/templates/purchaseOrderView.html', purchaseOrderViewTemplate);
      $templateCache.put('changeOrder/templates/changeOrder.html', changeOrderTemplate);
      $templateCache.put('changeOrder/templates/changeOrderView.html', changeOrderViewTemplate);
      $templateCache.put('viewDocument/templates/viewDocument.html', viewDocumentTemplate);
      $templateCache.put('requestForInformation/templates/requestForInformation.html', requestForInformationTemplate);
      $templateCache.put('requestForInformation/templates/requestForInformationView.html', requestForInformationViewTemplate);
      $templateCache.put('transmittal/templates/transmittal.html', transmittalTemplate);
      $templateCache.put('transmittal/templates/transmittalView.html', transmittalViewTemplate);
      $templateCache.put('onFile/templates/upload.html', uploadTemplate);
      $templateCache.put('onFile/templates/attachmentList.html', attachmentListTemplate);
      $templateCache.put('onFile/templates/pdfAttachmentList.html', pdfAttachmentListTemplate);
      $templateCache.put('onFile/templates/deleteResponse.html', deleteReponseTemplate);
      $templateCache.put('onFile/templates/allDueDateFilter.html', allDueDateFilterTpl);
      $templateCache.put('onFile/templates/submittalDueDateFilter.html', submittalDueDateFilterTpl);
      $templateCache.put('onFile/templates/approvalDueDateFilter.html', approvalDueDateFilterTpl);
    }]);

  module.controller('OnFileController', controller);
  module.controller('PurchaseOrderController', purchaseOrderController);
  module.controller('ChangeOrderController', changeOrderController);
  module.controller('ViewDocumentController', viewDocumentController);
  module.controller('RequestForInformationController', requestForInformationController);
  module.controller('TransmittalController', transmittalController);
  module.controller('OnFileUploadController', uploadController);
  module.controller('DeleteResponseController', deleteResponseController);

  module.directive('attachmentList', attachmentListDirective);
  module.directive('pdfAttachmentList', pdfAttachmentListDirective);

  module.config([
      '$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('app.onFile', {
            url: '/onFile',
            templateUrl: 'onFile/templates/onFile.html',
            controller: 'OnFileController',
            reloadOnSearch: false,
            resolve: {
              projectValid: [
                '$location',
                'projectContext',
                '$q',
                '$state',
                '$window',
                'permissionFactory',
                function($location,
                         projectContext,
                         $q,
                         $state,
                         $window,
                         permissionFactory) {
                  var deferred = $q.defer();
                  if(projectContext.valid() && permissionFactory.checkMenuPermission('ONFILE')) {
                    deferred.resolve();
                  } else {
                    $window.location.href = $state.href('app.projectlist');
                  }
                  return deferred.promise;
                }]
            }
          })
          .state('app.onFile.CO', {
            url: '/change-order?docId',
            templateUrl: 'changeOrder/templates/changeOrder.html',
            controller: 'ChangeOrderController',
            reloadOnSearch: false,
            resolve: {
              document: [
                '$location',
                '$q',
                '$state',
                '$window',
                'onFileFactory',
                '$stateParams',
                'accountFactory',
                'companyFactory',
                function($location,
                         $q,
                         $state,
                         $window,
                         onFileFactory,
                         $stateParams,
                         accountFactory,
                         companyFactory) {
                  var deferred = $q.defer();
                  //parse key values
                  function transformKeyValues(keyValues) {
                    var newKeyValues = {};
                    for(var i = 0; i < keyValues.length; i++) {
                      var keyValue = keyValues[i];
                      var key = keyValue.key;
                      var value = keyValue.value;
                      if(keyValue.key === 'date_created' || keyValue.key === 'date' || keyValue.key === 'received_by_date' || keyValue.key === 'sent_by_date' || keyValue.key === 'due_by_date') {
                        value = new Date(value);
                      }
                      else if(keyValue.key === 'receiverId') {
                        value = parseInt(value);
                      }
                      newKeyValues[key] = value;
                    }
                    return newKeyValues;
                  }

                  //parse grid key value
                  function transformGridKeyValues(gridKeyValues) {
                    var newGridKeyValues = [];
                    for(var i = 0; i < gridKeyValues.length; i++) {
                      var grid = gridKeyValues[i];
                      if(newGridKeyValues[grid.gridRowIndex] === undefined) {
                        newGridKeyValues[grid.gridRowIndex] = {};
                        var key = grid.key;
                        var value = grid.value;
                        newGridKeyValues[grid.gridRowIndex][key] = value;
                      } else {
                        newGridKeyValues[grid.gridRowIndex][grid.key] = grid.value;
                      }
                    }
                    return newGridKeyValues;
                  }

                  if(!$stateParams.docId) {
                    deferred.resolve();
                  } else {
                    onFileFactory.getDocumentById($stateParams.docId)
                      .success(function(resp) {
                        var document = resp.document;
                        if(document.documentTemplate.documentTemplateId !== 2) {
                          $window.location.href = $state.href('app.onFile');
                        }
                        var keyValues = transformKeyValues(document.keyValues);
                        if(document.gridKeyValues && document.gridKeyValues.length > 0) {
                          document.gridKeyValues = transformGridKeyValues(document.gridKeyValues);
                        }

                        document.keyValues = keyValues;

                        //get information
                        accountFactory.userDetails({"userId": document.createdBy, "accountStatus": null}).then(function(value){
                          document.fromUser = value.data.user;
                          companyFactory.get({
                            "companyId" : value.data.user.contact.company.companyId
                          }).then(function(company) {
                            document.fromUser.company = company.data.company;
                          });
                        });

                        accountFactory.userDetails({"userId": document.keyValues.receiverId, "accountStatus": null}).then(function(value){
                          document.toUser = value.data.user;
                          companyFactory.get({
                            "companyId" : value.data.user.contact.company.companyId
                          }).then(function(company) {
                            document.toUser.company = company.data.company;
                          });
                        });

                        deferred.resolve(document);
                      })
                      .error(function(error) {
                        $location.search('taskId', null);
                        deferred.resolve();
                      });
                  }
                  return deferred.promise;
                }]
            }
          })
          .state('app.onFile.PO', {
            url: '/purchase-order?docId',
            templateUrl: 'purchaseOrder/templates/purchaseOrder.html',
            controller: 'PurchaseOrderController',
            reloadOnSearch: false,
            resolve: {
              document: [
                '$location',
                '$q',
                '$state',
                '$window',
                'onFileFactory',
                '$stateParams',
                'accountFactory',
                'companyFactory',
                function($location,
                         $q,
                         $state,
                         $window,
                         onFileFactory,
                         $stateParams,
                         accountFactory,
                         companyFactory) {
                  var deferred = $q.defer();

                  //parse key values
                  function transformKeyValues(keyValues) {
                    var newKeyValues = {};
                    for(var i = 0; i < keyValues.length; i++) {
                      var keyValue = keyValues[i];
                      var key = keyValue.key;
                      var value = keyValue.value;
                      if(keyValue.key === 'date_created' || keyValue.key === 'date' || keyValue.key === 'received_by_date' || keyValue.key === 'sent_by_date' || keyValue.key === 'due_by_date') {
                        value = new Date(value);
                      }
                      else if(keyValue.key === 'receiverId' || keyValue.key === 'ship_to_company') {
                        value = parseInt(value);
                      }
                      newKeyValues[key] = value;
                    }
                    return newKeyValues;
                  }

                  //parse grid key value
                  function transformGridKeyValues(gridKeyValues) {
                    var newGridKeyValues = [];
                    for(var i = 0; i < gridKeyValues.length; i++) {
                      var grid = gridKeyValues[i];
                      if(newGridKeyValues[grid.gridRowIndex] === undefined) {
                        newGridKeyValues[grid.gridRowIndex] = {};
                        var key = grid.key;
                        var value = grid.value;
                        newGridKeyValues[grid.gridRowIndex][key] = value;
                      } else {
                        newGridKeyValues[grid.gridRowIndex][grid.key] = grid.value;
                      }
                    }
                    return newGridKeyValues;
                  }

                  if(!$stateParams.docId) {
                    deferred.resolve();
                  } else {
                    onFileFactory.getDocumentById($stateParams.docId).success(
                      function(resp) {
                        var document = resp.document;
                        if(document.documentTemplate.documentTemplateId !== 1) {
                          $window.location.href = $state.href('app.onFile');
                        }
                        var keyValues = transformKeyValues(document.keyValues);
                        if(document.gridKeyValues && document.gridKeyValues.length > 0) {
                          document.gridKeyValues = transformGridKeyValues(document.gridKeyValues);
                        }

                        document.keyValues = keyValues;

                        //get information
                        accountFactory.userDetails({"userId": document.createdBy, "accountStatus": null}).then(function(value){
                          document.fromUser = value.data.user;
                          companyFactory.get({
                            "companyId" : value.data.user.contact.company.companyId
                          }).then(function(company) {
                            document.fromUser.company = company.data.company;
                          });
                        });

                        accountFactory.userDetails({"userId": document.keyValues.receiverId, "accountStatus": null}).then(function(value){
                          document.toUser = value.data.user;
                          companyFactory.get({
                            "companyId" : value.data.user.contact.company.companyId
                          }).then(function(company) {
                            document.toUser.company = company.data.company;
                          });
                        });

                        deferred.resolve(document);
                      }).error(function(error) {
                        $location.search('taskId', null);
                        deferred.resolve();
                      });
                  }
                  return deferred.promise;
                }]
            }
          })
          .state('app.onFile.RIF', {
            url: '/request-for-information?docId',
            templateUrl: 'requestForInformation/templates/requestForInformation.html',
            controller: 'RequestForInformationController',
            reloadOnSearch: false,
            resolve: {
              document: [
                '$location',
                '$q',
                '$state',
                '$window',
                'onFileFactory',
                '$stateParams',
                'accountFactory',
                'companyFactory',
                function($location,
                         $q,
                         $state,
                         $window,
                         onFileFactory,
                         $stateParams,
                         accountFactory,
                         companyFactory) {
                  var deferred = $q.defer();

                  //parse key values
                  function transformKeyValues(keyValues) {
                    var newKeyValues = {};
                    for(var i = 0; i < keyValues.length; i++) {
                      var keyValue = keyValues[i];
                      var key = keyValue.key;
                      var value = keyValue.value;
                      if(keyValue.key === 'date_created' || keyValue.key === 'date' || keyValue.key === 'received_by_date' || keyValue.key === 'sent_by_date' || keyValue.key === 'due_by_date') {
                        value = new Date(value);
                      }
                      else if(keyValue.key === 'receiverId') {
                        value = parseInt(value);
                      }
                      newKeyValues[key] = value;
                    }
                    return newKeyValues;
                  }

                  //parse grid key value
                  function transformGridKeyValues(gridKeyValues) {
                    var newGridKeyValues = [];
                    for(var i = 0; i < gridKeyValues.length; i++) {
                      var grid = gridKeyValues[i];
                      if(newGridKeyValues[grid.gridRowIndex] === undefined) {
                        newGridKeyValues[grid.gridRowIndex] = {};
                        var key = grid.key;
                        var value = grid.value;
                        newGridKeyValues[grid.gridRowIndex][key] = value;
                      } else {
                        newGridKeyValues[grid.gridRowIndex][grid.key] = grid.value;
                      }
                    }
                    return newGridKeyValues;
                  }

                  if(!$stateParams.docId) {
                    deferred.resolve();
                  } else {
                    onFileFactory.getDocumentById($stateParams.docId).success(
                      function(resp) {
                        var document = resp.document;
                        if(document.documentTemplate.documentTemplateId !== 3) {
                          $window.location.href = $state.href('app.onFile');
                        }
                        var keyValues = transformKeyValues(document.keyValues);
                        if(document.gridKeyValues && document.gridKeyValues.length > 0) {
                          document.gridKeyValues = transformGridKeyValues(document.gridKeyValues);
                        }

                        document.keyValues = keyValues;

                        //get information
                        accountFactory.userDetails({"userId": document.createdBy, "accountStatus": null}).then(function(value){
                          document.fromUser = value.data.user;
                          companyFactory.get({
                            "companyId" : value.data.user.contact.company.companyId
                          }).then(function(company) {
                            document.fromUser.company = company.data.company;
                          });
                        });

                        accountFactory.userDetails({"userId": document.keyValues.receiverId, "accountStatus": null}).then(function(value){
                          document.toUser = value.data.user;
                          companyFactory.get({
                            "companyId" : value.data.user.contact.company.companyId
                          }).then(function(company) {
                            document.toUser.company = company.data.company;
                          });
                        });

                        deferred.resolve(document);
                      }).error(function(error) {
                        $location.search('taskId', null);
                        deferred.resolve();
                      });
                  }
                  return deferred.promise;
                }],
              contactList: [
                'onContactFactory',
                '$rootScope',
                '$q',
                function(onContactFactory,
                         $rootScope,
                         $q) {
                  var deferred = $q.defer();
                  onContactFactory.getContactList($rootScope.currentProjectInfo.projectId, $rootScope.currentUserInfo.userId)
                    .success(function(content) {
                      deferred.resolve(content.projectMemberList);
                    })
                    .error(function(content) {
                      deferred.resolve([]);
                    });
                  return deferred.promise;
                }],
              responses: [
                '$q',
                'onFileFactory',
                '$stateParams',
                function($q,
                         onFileFactory,
                         $stateParams) {
                  var deferred = $q.defer();
                  if($stateParams.docId) {
                    onFileFactory.getResponse($stateParams.docId)
                      .success(function(resp) {
                        deferred.resolve(resp.documentResponses);
                      })
                      .error(function() {
                        deferred.resolve([]);
                      });
                  }
                  else {
                    deferred.resolve([]);
                  }
                  return deferred.promise;
                }]
            }
          })
          .state('app.onFile.Trans', {
            url: '/transmittal?docId',
            templateUrl: 'transmittal/templates/transmittal.html',
            controller: 'TransmittalController',
            reloadOnSearch: false,
            resolve: {
              document: [
                '$location',
                '$q',
                '$state',
                '$window',
                'onFileFactory',
                '$stateParams',
                'accountFactory',
                'companyFactory',
                function($location,
                         $q,
                         $state,
                         $window,
                         onFileFactory,
                         $stateParams,
                         accountFactory,
                         companyFactory) {
                  var deferred = $q.defer();

                  //parse key values
                  function transformKeyValues(keyValues) {
                    var newKeyValues = {};
                    for(var i = 0; i < keyValues.length; i++) {
                      var keyValue = keyValues[i];
                      var key = keyValue.key;
                      var value = keyValue.value;
                      if(keyValue.key === 'date_created' || keyValue.key === 'date' || keyValue.key === 'received_by_date' || keyValue.key === 'sent_by_date' || keyValue.key === 'due_by_date') {
                        value = new Date(value);
                      }
                      else if(keyValue.key === 'receiverId') {
                        value = parseInt(value);
                      }
                      newKeyValues[key] = value;
                    }
                    return newKeyValues;
                  }

                  //parse grid key value
                  function transformGridKeyValues(gridKeyValues) {
                    var newGridKeyValues = [];
                    for(var i = 0; i < gridKeyValues.length; i++) {
                      var grid = gridKeyValues[i];
                      if(newGridKeyValues[grid.gridRowIndex] === undefined) {
                        newGridKeyValues[grid.gridRowIndex] = {};
                        var key = grid.key;
                        var value = grid.value;
                        newGridKeyValues[grid.gridRowIndex][key] = value;
                      } else {
                        newGridKeyValues[grid.gridRowIndex][grid.key] = grid.value;
                      }
                    }
                    return newGridKeyValues;
                  }

                  if(!$stateParams.docId) {
                    deferred.resolve();
                  } else {
                    onFileFactory.getDocumentById($stateParams.docId).success(
                      function(resp) {
                        var document = resp.document;
                        if(document.documentTemplate.documentTemplateId !== 4) {
                          $window.location.href = $state.href('app.onFile');
                        }
                        var keyValues = transformKeyValues(document.keyValues);
                        if(document.gridKeyValues && document.gridKeyValues.length > 0) {
                          document.gridKeyValues = transformGridKeyValues(document.gridKeyValues);
                        }

                        document.keyValues = keyValues;

                        //get information
                        accountFactory.userDetails({"userId": document.createdBy, "accountStatus": null}).then(function(value){
                          document.fromUser = value.data.user;
                          companyFactory.get({
                            "companyId" : value.data.user.contact.company.companyId
                          }).then(function(company) {
                            document.fromUser.company = company.data.company;
                          });
                        });

                        accountFactory.userDetails({"userId": document.keyValues.receiverId, "accountStatus": null}).then(function(value){
                          document.toUser = value.data.user;
                          companyFactory.get({
                            "companyId" : value.data.user.contact.company.companyId
                          }).then(function(company) {
                            document.toUser.company = company.data.company;
                          });
                        });

                        deferred.resolve(document);
                      }).error(function(error) {
                        $location.search('taskId', null);
                        deferred.resolve();
                      });
                  }
                  return deferred.promise;
                }]
            }
          });
      }
    ]
  );

  return module;
});
