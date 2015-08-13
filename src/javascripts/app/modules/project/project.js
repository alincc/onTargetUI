/**
 * Created by thophan on 8/12/2015.
 */
define(function (require){
  'use strict';
  var angular = require('angular'),
    angularBootstrap = require('angularBootstrap'),
    uiRouter = require('uiRouter'),
    config = require('app/config'),
    angularMessages = require('angularMessages'),
    controller = require('./controllers/list'),
    createController = require('./controllers/create'),
    editController = require('./controllers/edit'),
    deleteController = require('./controllers/delete'),
    template = require('text!./templates/list.html'),
    createTemplate = require('text!./templates/create.html'),
    editTemplate = require('text!./templates/edit.html'),
    deleteTemplate = require('text!./templates/delete.html'),
    createOrUpdateTemplate = require('text!./templates/_createOrUpdate.html'),
    projectServiceModule = require('app/common/services/project'),
    accountServiceModule = require('app/common/services/account'),
    companyServiceModule = require('app/common/services/company'),
    userContextModule = require('app/common/context/user');
  var module = angular.module('app.project', ['ui.router', 'ui.bootstrap', 'app.config', 'common.context.user', 'common.services.account', 'common.services.project', 'common.services.company', 'ngMessages']);

  module.run(['$templateCache', function ($templateCache){
    $templateCache.put('project/templates/list.html', template);
    $templateCache.put('project/templates/_createOrUpdate.html', createOrUpdateTemplate);
    $templateCache.put('project/templates/create.html', createTemplate);
    $templateCache.put('project/templates/edit.html', editTemplate);
    $templateCache.put('project/templates/delete.html', deleteTemplate);
  }]);

  module.controller('ProjectListController', controller);
  module.controller('ProjectCreateController', createController);
  module.controller('ProjectEditController', editController);
  module.controller('ProjectDeleteController', deleteController);

  module.config(
    ['$stateProvider',
      function ($stateProvider){
        $stateProvider
          .state('app.projectlist', {
            url: '/projectlist',
            templateUrl: "project/templates/list.html",
            controller: 'ProjectListController',
            authorization: true
          });
      }
    ]
  );

  return module;
});