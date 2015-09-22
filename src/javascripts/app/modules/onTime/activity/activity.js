define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    uiRouter = require('uiRouter'),
    controller = require('./controllers/activity'),
    createController = require('./controllers/create'),
    editController = require('./controllers/edit'),
    deleteController = require('./controllers/delete'),
    importController = require('./controllers/import'),
    template = require('text!./templates/activity.html'),
    createTemplate = require('text!./templates/create.html'),
    editTemplate = require('text!./templates/edit.html'),
    deleteTemplate = require('text!./templates/delete.html'),
    importTemplate = require('text!./templates/import.html'),
    createOrUpdateTemplate = require('text!./templates/_createOrUpdate.html'),
    companyServiceModule = require('app/common/services/company'),
    projectServiceModule = require('app/common/services/project'),
    activityServiceModule = require('app/common/services/activity'),
    notificationServiceModule= require('app/common/services/notifications'),
    toaster= require('toaster'),
    parserServiceModule= require('app/common/services/parser'),
    userContextModule = require('app/common/context/user'),
    projectChooserDirective = require('app/common/directives/projectChooser/projectChooser'),
    ngFileUpload = require('ngFileUpload'),
    notification = require('app/common/services/notifications'),
    userNotification = require('app/common/services/userNotifications'),
    permissionServiceModule = require('app/common/services/permission');
  var module = angular.module('app.activity', ['ui.router', 'app.config', 'common.context.user', 'common.services.project', 'common.services.company', 'common.services.activity', 'common.services.notifications', 'common.directives.projectChooser', 'ngFileUpload', 'common.services.parser', 'toaster', 'common.services.notifications', 'common.services.userNotifications', 'common.services.permission']);

  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('onTime/activity/templates/activity.html', template);
    $templateCache.put('onTime/activity/templates/_createOrUpdate.html', createOrUpdateTemplate);
    $templateCache.put('onTime/activity/templates/create.html', createTemplate);
    $templateCache.put('onTime/activity/templates/edit.html', editTemplate);
    $templateCache.put('onTime/activity/templates/delete.html', deleteTemplate);
    $templateCache.put('onTime/activity/templates/import.html', importTemplate);
  }]);

  module.controller('ActivityController', controller);
  module.controller('CreateActivityController', createController);
  module.controller('EditActivityController', editController);
  module.controller('DeleteActivityController', deleteController);
  module.controller('ImportActivityController', importController);


  return module;
});
