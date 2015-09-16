/**
 * Created by thophan on 8/7/2015.
 */
define(function(require) {
    'use strict';
    var angular = require('angular'),
        config = require('app/config'),
        uiRouter = require('uiRouter'),
        controller = require('./controllers/editprofile'),
        template = require('text!./templates/editprofile.html'),
        userContextModule = require('app/common/context/user'),
        accountServiceModule = require('app/common/services/account'),
        notificationServiceModule= require('app/common/services/notifications'),
        uimask  = require('angularUiMask'),
        ngFileUpload = require('ngFileUpload'),
        toaster = require('toaster');
    var module = angular.module('app.editprofile', ['ui.router', 'app.config', 'common.context.user', 'common.services.account', 'ui.mask', 'common.services.notifications', 'ngFileUpload', 'toaster']);

    module.run(['$templateCache', function($templateCache) {
        $templateCache.put('editprofile/templates/editprofile.html', template);
    }]);

    module.controller('EditProfileController', controller);

    module.config(
        ['$stateProvider',
            function($stateProvider) {
                $stateProvider
                    .state('app.editprofile', {
                        url: '/editprofile',
                        templateUrl: "editprofile/templates/editprofile.html",
                        controller: 'EditProfileController',
                        authorization: true,
                        fullWidth: true
                    });
            }
        ]
    );

    return module;
});
