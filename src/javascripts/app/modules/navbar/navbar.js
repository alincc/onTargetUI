define(function (require){
  'use strict';
  var angular = require('angular'),
    navbarTemplate = require('text!./templates/navbar.html'),
    inviteCollaboratorsTemplate = require('text!./templates/inviteCollaborators.html'),
    navbarController = require('./controllers/navbar'),
    inviteCollaboratorsController = require('./controllers/inviteCollaborators'),
    userContextModule = require('app/common/context/user'),
    accountServiceModule = require('app/common/services/account'),
    notificationsServiceModule = require('app/common/services/notifications'),
    companyServiceModule = require('app/common/services/company'),
    inviteCollaboratorServiceModule = require('app/common/services/inviteCollaborator'),
    userNotificationsServiceModule = require('app/common/services/userNotifications'),
    pushServiceModule = require('app/common/services/push'),
    showHideCollaborateDirective = require('./directives/showHideCollaborate'),
    angularMoment = require('angularMoment'),
    toaster = require('toaster'),
    companyTypesData = require('text!app/common/resources/companyTypes.json');

  var module = angular.module('app.navbar', ['common.context.user', 'common.services.account', 'common.services.notifications', 'common.services.inviteCollaborator', 'angularMoment', 'common.services.company', 'common.services.push', 'common.services.userNotifications', 'toaster']);

  module.run(['$templateCache', function ($templateCache){
    $templateCache.put('navbar/templates/navbar.html', navbarTemplate);
    $templateCache.put('navbar/templates/inviteCollaborators.html', inviteCollaboratorsTemplate);
  }]);

  module.controller('NavbarController', navbarController);
  module.controller('InviteCollaboratorsController', inviteCollaboratorsController);

  module.directive('showHideCollaborate', showHideCollaborateDirective);

  return module;
});