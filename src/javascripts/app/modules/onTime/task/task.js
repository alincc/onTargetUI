/**
 * Created by thophan on 8/18/2015.
 */
define(function(require){
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    uiRouter = require('uiRouter'),
    controller = require('./controllers/task'),
    createController = require('./controllers/create'),
    editController = require('./controllers/edit'),
    deleteController = require('./controllers/delete'),
    infoController = require('./controllers/info'),
    logisticsController = require('./controllers/logistics'),
    template = require('text!./templates/task.html'),
    createTemplate = require('text!./templates/create.html'),
    editTemplate = require('text!./templates/edit.html'),
    deleteTemplate = require('text!./templates/delete.html'),
    createOrUpdateTemplate = require('text!./templates/_createOrUpdate.html'),
    infoTemplate = require('text!./templates/info.html'),
    logisticsTemplate = require('text!./templates/logistics.html'),
    projectServiceModule = require('app/common/services/project'),
    activityServiceModule = require('app/common/services/activity'),
    notificationServiceModule = require('app/common/services/notifications'),
    taskServiceModule = require('app/common/services/task'),
    uploadServiceModule = require('app/common/services/file'),
    userContextModule = require('app/common/context/user'),
    taskFilterModule = require('app/common/filters/task'),
    angularUiSelect = require('angularUiSelect'),
    angularMoment = require('moment'),
    angularTouch = require('angularTouch'),
    ngLetterAvatar = require('ngLetterAvatar'),
    ngFileUpload = require('ngFileUpload'),
    requireMultiple = require('app/common/validators/requireMultiple'),
    monthName = require('app/common/filters/monthName'),
    userNotification = require('app/common/services/userNotifications'),
    permissionServiceModule = require('app/common/services/permission'),
    fileDownloadPath = require('app/common/filters/fileDownloadPath');

  var module = angular.module('app.task', ['ui.router', 'app.config', 'common.context.user', 'common.services.project', 'common.services.activity', 'common.services.task', 'common.filters.task', 'common.services.notifications', 'angularMoment', 'ngTouch', 'common.services.file', 'ui.select', 'ngLetterAvatar', 'ngFileUpload', 'common.validators.requireMultiple', 'common.filters.monthName', 'common.services.userNotifications', 'common.services.permission', 'common.filters.fileDownloadPath']);

  module.run(['$templateCache', function($templateCache){
    $templateCache.put('onTime/task/templates/task.html', template);
    $templateCache.put('onTime/task/templates/_createOrUpdate.html', createOrUpdateTemplate);
    $templateCache.put('onTime/task/templates/create.html', createTemplate);
    $templateCache.put('onTime/task/templates/edit.html', editTemplate);
    $templateCache.put('onTime/task/templates/delete.html', deleteTemplate);
    $templateCache.put('onTime/task/templates/info.html', infoTemplate);
    $templateCache.put('onTime/task/templates/logistics.html', logisticsTemplate);
  }]);

  // Controllers
  module.controller('TaskController', controller);
  module.controller('CreateTaskController', createController);
  module.controller('EditTaskController', editController);
  module.controller('DeleteTaskController', deleteController);
  module.controller('InfoTaskController', infoController);
  module.controller('LogisticsTaskController', logisticsController);

  return module;
});
