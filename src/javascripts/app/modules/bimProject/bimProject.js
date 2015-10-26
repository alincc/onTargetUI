define(function (require){
  'use strict';
  var angular = require('angular'),
    uiRouter = require('uiRouter'),
    config = require('app/config'),
    jqueryUpload = require('jqueryUpload'),
    jqueryScrollTo = require('jqueryScrollTo'),
    History = require('History'),
    indexTemplate = require('text!./index.html'),
    bimProjectTemplate = require('text!./templates/bimProject.html'),
    listTemplate = require('text!./templates/listProject.html'),
    projectTemplate = require('text!./templates/project.html'),
    addProjectTemplate = require('text!./templates/addProject.html'),
    commentTemplate = require('text!./templates/comment.html'),
    bimProjectController = require('./controllers/bimProject'),
    listController = require('./controllers/listProject'),
    projectDetailController = require('./controllers/project'),
    addProjectController = require('./controllers/addProject'),
    commentController = require('./controllers/comment'),
    onBimFactory = require('app/common/services/onBim');

  var module = angular.module('app.bimProject', [
    'ui.router',
    'app.config',
    'common.services.onBim'
  ]);

  module.run([
    '$templateCache',
    '$rootScope',
    '$state',
    function ($templateCache,
              $rootScope,
              $state){
      $templateCache.put('bimProject/templates/bimProject.html', bimProjectTemplate);
      $templateCache.put('bimProject/templates/index.html', indexTemplate);
      $templateCache.put('listProjectBim/templates/listProjectBim.html', listTemplate);
      $templateCache.put('bimProjectDetail/templates/bimProjectDetail.html', projectTemplate);
      $templateCache.put('bimAddProject/templates/bimAddProject.html', addProjectTemplate);
      $templateCache.put('bimComment/templates/bimComment.html', commentTemplate);
    }]);

  module.controller('BimProjectController', bimProjectController);
  module.controller('BimListProjectController', listController);
  module.controller('BimProjectDetailController', projectDetailController);
  module.controller('BimAddProjectController', addProjectController);
  module.controller('BimCommentController', commentController);

  module.config(
    ['$stateProvider', '$urlRouterProvider',
      function ($stateProvider, $urlRouterProvider){
        $stateProvider
          .state('app.bimProject', {
            url: '/bim-project',
            templateUrl: 'bimProject/templates/bimProject.html',
            controller: 'BimProjectController',
            abstract: true,
            resolve: {
              authorization: ['$q', 'onBimFactory', function ($q, onBimFactory){
                var deferred = $q.defer();
                console.log('Authorizing');
                onBimFactory.login()
                  .then(function (){
                    //console.log($state.href('app.onBim.listProject'));
                    //$location.href($state.href('app.onBim.listProject'));
                    console.log('Authorized');
                    deferred.resolve();
                  }, function (err){
                    console.log(err);
                    deferred.reject();
                  });
                return deferred.promise;
              }]
            }
          })
          .state('app.bimProject.listProject', {
            url: '/list-project',
            templateUrl: 'listProjectBim/templates/listProjectBim.html',
            controller: 'BimListProjectController',
            reloadOnSearch: false
          })
          .state('app.bimProject.project', {
            url: '/project?poid&projectBimFileId',
            templateUrl: 'bimProjectDetail/templates/bimProjectDetail.html',
            controller: 'BimProjectDetailController',
            reloadOnSearch: false,
            resolve: {
              checkParam : ['$q', 'onBimFactory', '$stateParams', function ($q, onBimFactory, $stateParams){
                var deferred = $q.defer();
                if(!$stateParams.poid) {
                  deferred.reject();
                } else {
                  deferred.resolve();
                }
                return deferred.promise;
              }]
            }
          })
          .state('app.bimProject.addProject', {
            url: '/add-project',
            templateUrl: 'bimAddProject/templates/bimAddProject.html',
            controller: 'BimAddProjectController',
            reloadOnSearch: false
          });
      }
    ]
  );

  return module;
});