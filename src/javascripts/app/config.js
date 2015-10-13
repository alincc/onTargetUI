define(function(require){
  'use strict';
  var angular = require('angular'),
    lodash = require('lodash'),
    paginationTemplate = require('text!app/common/templates/dirPagination.tpl.html'),
    angularUtilsPagination = require('angularUtilsPagination'),
    toaster = require('toaster'),
    userContextModule = require('app/common/context/user'),
    projectContextModule = require('app/common/context/project');


  var module = angular.module('app.config', ['ui.router', 'angularUtils.directives.dirPagination', 'common.context.user', 'common.context.project', 'toaster']);
  module.config(['$locationProvider', '$urlRouterProvider', '$httpProvider', 'paginationTemplateProvider',
    function($locationProvider, $urlRouterProvider, $httpProvider, paginationTemplateProvider){

      //Enable cross domain calls
      $httpProvider.defaults.useXDomain = true;
      //$httpProvider.defaults.headers.Origin = 'null';

      // Pagination template config
      paginationTemplateProvider.setPath('javascripts/app/common/templates/dirPagination.tpl.html');


      // Authorization header
      $httpProvider.interceptors.push(['userContext', '$rootScope', function(userContext, $rootScope){
        return {
          request: function(config){
            if(angular.isObject(config.data) && (!angular.isDefined(config.headers.Authorization) || config.headers.Authorization !== false)) {
              config.data["baseRequest"] = {
                "loggedInUserId": $rootScope.currentUserInfo.userId,
                "loggedInUserProjectId": $rootScope.currentProjectInfo.projectId ? $rootScope.currentProjectInfo.projectId : 1
              };
            }
            return config;
          }
        }
      }]);

      // Error handler
      $httpProvider.interceptors.push(['$q', 'toaster', 'appConstant', 'pushFactory', '$location', '$rootScope', 'userContext', 'projectContext', function($q, toaster, constant, pushFactory, $location, $rootScope, userContext, projectContext){
        return {
          response: function(response){
            var defer = $q.defer();
            if(angular.isArray(response.data) && response.data.length > 0 && angular.isDefined(response.data[0]["message"]) && angular.isDefined(response.data[0]["messageTemplate"]) && angular.isDefined(response.data[0]["path"])) {
              var errorMessageHtml = '';
              _.each(response.data, function(el){
                if(el.path !== '0') {
                  errorMessageHtml += '- ' + el.path + ' ' + el.message + ' </br>';
                } else {
                  errorMessageHtml += '- ' + el.message + ' </br>';
                }
              });
              toaster.pop({
                type: 'error',
                title: 'Error',
                body: errorMessageHtml,
                bodyOutputType: 'trustedHtml'
              });
              defer.reject(response);
            }
            else if(response && response.data && response.data.returnVal === 'ERROR') {
              toaster.pop('error', 'Error', response.data.returnMessage);
              defer.reject(response);
            } else {
              if((response.config.url.indexOf(constant.domain) > -1 || response.config.url.indexOf(constant.domain) > -1) && response.config.headers['AutoAlert']) {
                toaster.pop('success', 'Success', response.data.returnMessage);
              }
              defer.resolve(response);
            }

            return defer.promise;
          },
          responseError: function(response){
            console.log(response);

            if(angular.isObject(response) && response.config && (response.config.url.indexOf(constant.domain) > -1 || response.config.url.indexOf(constant.nodeServer) > -1)) {
              if(response.status === 400) {
                if(angular.isString(response.data)) {
                  toaster.pop('error', "Error", response.data);
                }
                else if(angular.isArray(response.data) && response.data.length > 0 && angular.isDefined(response.data[0]["message"]) && angular.isDefined(response.data[0]["messageTemplate"]) && angular.isDefined(response.data[0]["path"])) {
                  var errorMessageHtml = '';
                  _.each(response.data, function(el){
                    if(el.path !== '0') {
                      errorMessageHtml += '- ' + el.path + ' ' + el.message + ' </br>';
                    } else {
                      errorMessageHtml += '- ' + el.message + ' </br>';
                    }
                  });
                  toaster.pop({
                    type: 'error',
                    title: 'Error',
                    body: errorMessageHtml,
                    bodyOutputType: 'trustedHtml'
                  });
                }
              }
              else if(response.status === 401) {
                toaster.pop('error', "Permission denied", "You have no permission to access this. Please contact your administrator");
                //pushFactory.unbind('onTargetAll');
                //pushFactory.unbind('private-user-' + $rootScope.currentUserInfo.userId);
                //userContext.clearInfo();
                //projectContext.clearInfo();
                //$location.path('/signin');
              }
            }

            return $q.reject(response);
          }
        }
      }]);

      //Remove the header used to identify ajax call  that would prevent CORS from working
      delete $httpProvider.defaults.headers.common['X-Requested-With'];

      $urlRouterProvider.otherwise("/signin");

      // Default route configuration
      $locationProvider.html5Mode({
        enabled: false,
        requireBase: false
      });
    }
  ]);

  module.run(['$rootScope', 'userContext', '$location', function($rootScope, userContext, $location){
    // Validate Authorization Page
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
      if(userContext.authentication().isAuth || toState.authorization === false) {

      } else {
        $location.path('/signin');
      }
    });

    // app settings
    $rootScope.appSettings = {
      hideAside: false
    };
  }]);

  module.constant('appConstant', {
    domain: 'http://localhost:9000/ontargetrs/services',
    baseUrl: 'http://localhost:9000',
    nodeServer: 'http://demo.newoceaninfosys.com:3215',
    resourceUrl: 'http://demo.newoceaninfosys.com:3215',
    app: {
      name: "OnTarget",
      id: "OnTarget",
      version: "1.0.1",
      allowedImageExtension: /(jpeg|jpg|png)$/,
      // for chart colors
      color: {
        primary: '#7266ba',
        info: '#23b7e5',
        success: '#27c24c',
        warning: '#fad733',
        danger: '#f05050',
        light: '#e8eff0',
        dark: '#3a3f51',
        black: '#1c2b36'
      },
      settings: {
        themeID: 1,
        navbarHeaderColor: 'bg-app',
        navbarCollapseColor: 'bg-app',
        asideColor: 'bg-white',
        headerFixed: true,
        asideFixed: false,
        asideFolded: false,
        asideDock: false,
        container: false,
        hideAside: false,
        userNotificationsPageSize: 999,
        //userNotificationsPageSize: 10,
        userNotificationsInterval: 600000 // 10 minutes
      },
      dateFormat: 'MM/dd/yyyy',
      statusColours: [
        '55d63c',
        'e2df05',
        'ffb56d',
        'e25805'
      ],
      percentageColor: [
        'FF0000',
        '800000',
        'FFFF00',
        'FFBF00',
        'e25805'
      ],
      projectHealthColours: [
        '#06bf3f', // green
        '#ff7e00', // orange
        '#4279bd', // blue
        '#46BFBD', // green
        '#FDB45C', // yellow
        '#949FB1', // grey
        '#4D5360'  // dark grey
      ]
    },
    openWeatherMap:{
      appId: 'd83ad50cdf64ae4f17132adbfd43cb90'
    },
    push: {
      API_KEY: 'c2f5de73a4caa3763726',
      channel: 'onTarget'
    },
    externalFiles: {
      // https://developers.google.com/drive/web/quickstart/js - Follow this instruction to get client_id, DO NOT change the scope if you know what are you doing
      googleDrive: {
        client_id: '119225888070-pkccaemomn8ksb6i2nvdj8q124koomdm.apps.googleusercontent.com',
        scope: ['https://www.googleapis.com/auth/drive']
      },
      // https://auth0.com/docs/connections/social/box - Follow this instruction to get client_id and client_secret.
      box: {
        client_id: 't5sfo0x515refc4tx9e13xy7p9n48v7q',
        client_secret: 'mnIGltu4VmpzAHSYNaPQCNt2ZpEMmG5Z'
      },
      // https://www.dropbox.com/developers/support - check this out to get client_id
      dropBox: {
        client_id: 'qmrfotonkpkkwh8'
      }
    }
  });

  return module;
});