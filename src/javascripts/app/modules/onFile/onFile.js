define(function(require) {
  'use strict';
  var angular = require('angular'),
    uiRouter = require('uiRouter'),
    template = require('text!./templates/onFile.html'),
    purchaseOrderTemplate = require('text!./templates/purchaseOrder.html'),
    changeOrderTemplate = require('text!./templates/changeOrder.html'),
    viewDocumentTemplate = require('text!./templates/viewDocument.html'),
    requestForInformationTemplate = require('text!./templates/requestForInformation.html'),
    transmittalTemplate = require('text!./templates/transmittal.html'),
    uploadTemplate = require('text!./templates/upload.html'),
    attachmentListTemplate = require('text!./templates/attachmentList.html'),
    attachmentListDirective = require('./directives/attachmentList'),
    controller = require('./controllers/onFileController'),
    purchaseOrderController = require('./controllers/purchaseOrderController'),
    changeOrderController = require('./controllers/changeOrderController'),
    viewDocumentController = require('./controllers/viewDocumentController'),
    requestForInformationController = require('./controllers/requestForInformationController'),
    transmittalController = require('./controllers/transmittalController'),
    uploadController = require('./controllers/upload'),
    projectContextModule = require('app/common/context/project'),
    permissionServiceModule = require('app/common/services/permission'),
    notification = require('app/common/services/notifications'),
    taskServiceModule = require('app/common/services/task'),
    onFileServiceModule = require('app/common/services/onFile'),
    companyServiceModule = require('app/common/services/company'),
    contactServiceModule = require('app/common/services/onContact'),
    fileServiceModule = require('app/common/services/file'),
    userContext = require('app/common/context/user'),
    documentServiceModule = require('app/common/services/document'),
    angularUiSelect = require('angularUiSelect');
  var module = angular.module('app.onFile', ['ui.router', 'app.config', 'common.context.project', 'common.services.permission', 'common.services.notifications', 'common.services.task', 'common.services.onFile', 'common.services.company', 'common.services.onContact', 'common.services.file', 'common.services.document', 'ui.select']);

  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('onFile/templates/onFile.html', template);
    $templateCache.put('purchaseOrder/templates/purchaseOrder.html', purchaseOrderTemplate);
    $templateCache.put('changeOrder/templates/changeOrder.html', changeOrderTemplate);
    $templateCache.put('viewDocument/templates/viewDocument.html', viewDocumentTemplate);
    $templateCache.put('requestForInformation/templates/requestForInformation.html', requestForInformationTemplate);
    $templateCache.put('transmittal/templates/transmittal.html', transmittalTemplate);
    $templateCache.put('onFile/templates/upload.html', uploadTemplate);
    $templateCache.put('onFile/templates/attachmentList.html', attachmentListTemplate);
  }]);

  module.controller('OnFileController', controller);
  module.controller('PurchaseOrderController', purchaseOrderController);
  module.controller('ChangeOrderController', changeOrderController);
  module.controller('ViewDocumentController', viewDocumentController);
  module.controller('RequestForInformationController', requestForInformationController);
  module.controller('TransmittalController', transmittalController);
  module.controller('OnFileUploadController', uploadController);

  module.directive('attachmentList', attachmentListDirective);

  module.config(
    ['$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('app.onFile', {
            url: '/onFile',
            templateUrl: 'onFile/templates/onFile.html',
            controller: 'OnFileController',
            reloadOnSearch: false,
            resolve: {
              projectValid: ['$location', 'projectContext', '$q', '$state', '$window', 'permissionFactory', function($location, projectContext, $q, $state, $window, permissionFactory) {
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
            url: '/change-order',
            templateUrl: 'changeOrder/templates/changeOrder.html',
            controller: 'ChangeOrderController',
            reloadOnSearch: false,
          })
          .state('app.onFile.PO', {
            url: '/purchase-order',
            templateUrl: 'purchaseOrder/templates/purchaseOrder.html',
            controller: 'PurchaseOrderController',
            reloadOnSearch: false,
          })
          .state('app.onFile.RIF', {
            url: '/request-for-information',
            templateUrl: 'requestForInformation/templates/requestForInformation.html',
            controller: 'RequestForInformationController',
            reloadOnSearch: false,
          })
          .state('app.onFile.Trans', {
            url: '/transmittal',
            templateUrl: 'transmittal/templates/transmittal.html',
            controller: 'TransmittalController',
            reloadOnSearch: false,
          });
      }
    ]
  );

  return module;
});
