define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    uiRouter = require('uiRouter'),
    controller = require('./controllers/activity'),
    createController = require('./controllers/create'),
    editController = require('./controllers/edit'),
    deleteController = require('./controllers/delete'),
    template = require('text!./templates/activity.html'),
    createTemplate = require('text!./templates/create.html'),
    editTemplate = require('text!./templates/edit.html'),
    deleteTemplate = require('text!./templates/delete.html'),
    createOrUpdateTemplate = require('text!./templates/_createOrUpdate.html'),
    companyServiceModule = require('app/common/services/company'),
    projectServiceModule = require('app/common/services/project'),
    activityServiceModule = require('app/common/services/activity'),
    notificationServiceModule= require('app/common/services/notifications'),
    userContextModule = require('app/common/context/user');
  var module = angular.module('app.activity', ['ui.router', 'app.config', 'common.context.user', 'common.services.project', 'common.services.company', 'common.services.activity', 'common.services.notifications']);

  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('onTime/activity/templates/activity.html', template);
    $templateCache.put('onTime/activity/templates/_createOrUpdate.html', createOrUpdateTemplate);
    $templateCache.put('onTime/activity/templates/create.html', createTemplate);
    $templateCache.put('onTime/activity/templates/edit.html', editTemplate);
    $templateCache.put('onTime/activity/templates/delete.html', deleteTemplate);
  }]);

  module.controller('ActivityController', controller);
  module.controller('CreateActivityController', createController);
  module.controller('EditActivityController', editController);
  module.controller('DeleteActivityController', deleteController);


  return module;
});
