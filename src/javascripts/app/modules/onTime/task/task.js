/**
 * Created by thophan on 8/18/2015.
 */
define(function(require) {
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
    ownerController = require('./controllers/owner'),
    commentController = require('./controllers/comment'),
    progressController = require('./controllers/progress'),
    attachmentController = require('./controllers/attachment'),
    budgetController = require('./controllers/budget'),
    template = require('text!./templates/task.html'),
    createTemplate = require('text!./templates/create.html'),
    editTemplate = require('text!./templates/edit.html'),
    deleteTemplate = require('text!./templates/delete.html'),
    createOrUpdateTemplate = require('text!./templates/_createOrUpdate.html'),
    infoTemplate = require('text!./templates/info.html'),
    logisticsTemplate = require('text!./templates/logistics.html'),
    ownerTemplate = require('text!./templates/owner.html'),
    commentTemplate = require('text!./templates/comment.html'),
    progressTemplate = require('text!./templates/progress.html'),
    attachmentTemplate = require('text!./templates/attachment.html'),
    budgetTemplate = require('text!./templates/budget.html'),
    projectServiceModule = require('app/common/services/project'),
    activityServiceModule = require('app/common/services/activity'),
    notificationServiceModule = require('app/common/services/notifications'),
    taskServiceModule = require('app/common/services/task'),
    uploadServiceModule = require('app/common/services/file'),
    userContextModule = require('app/common/context/user'),
    taskFilterModule = require('app/common/filters/task'),
    angularUiSelect = require('angularUiSelect'),
    angularMoment = require('moment'),
    angularSlider = require('angularSlider'),
    angularTouch = require('angularTouch'),
    ngLetterAvatar = require('ngLetterAvatar'),
    ngFileUpload = require('ngFileUpload'),
    requireMultiple = require('app/common/validators/requireMultiple');

  var module = angular.module('app.task', ['ui.router', 'app.config', 'common.context.user', 'common.services.project', 'common.services.activity', 'common.services.task', 'common.filters.task', 'common.services.notifications', 'angularMoment', 'vr.directives.slider', 'ngTouch', 'common.services.file', 'ui.select', 'ngLetterAvatar', 'ngFileUpload', 'common.validators.requireMultiple']);

  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('onTime/task/templates/task.html', template);
    $templateCache.put('onTime/task/templates/_createOrUpdate.html', createOrUpdateTemplate);
    $templateCache.put('onTime/task/templates/create.html', createTemplate);
    $templateCache.put('onTime/task/templates/edit.html', editTemplate);
    $templateCache.put('onTime/task/templates/delete.html', deleteTemplate);
    $templateCache.put('onTime/task/templates/info.html', infoTemplate);
    $templateCache.put('onTime/task/templates/logistics.html', logisticsTemplate);
    $templateCache.put('onTime/task/templates/owner.html', ownerTemplate);
    $templateCache.put('onTime/task/templates/comment.html', commentTemplate);
    $templateCache.put('onTime/task/templates/progress.html', progressTemplate);
    $templateCache.put('onTime/task/templates/attachment.html', attachmentTemplate);
    $templateCache.put('onTime/task/templates/budget.html', budgetTemplate);
  }]);

  module.controller('TaskController', controller);
  module.controller('CreateTaskController', createController);
  module.controller('EditTaskController', editController);
  module.controller('DeleteTaskController', deleteController);
  module.controller('InfoTaskController', infoController);
  module.controller('LogisticsTaskController', logisticsController);
  module.controller('OwnerTaskController', ownerController);
  module.controller('CommentTaskController', commentController);
  module.controller('ProgressTaskController', progressController);
  module.controller('AttachmentTaskController', attachmentController);
  module.controller('BudgetTaskController', budgetController);

  return module;
});
