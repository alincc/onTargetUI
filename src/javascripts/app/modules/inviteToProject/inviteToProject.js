define(function(require) {
  'use strict';
  var angular = require('angular'),
    projectServiceModule = require('app/common/services/project');
  var module = angular.module('app.inviteToProject', [
    'common.services.project'
  ]);
  module.config(
    ['$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('inviteToProject', {
            url: '/pages/invite-to-project?q',
            template: "",
            authorization: false,
            resolve: {
              check: [
                '$rootScope',
                'projectFactory',
                'userContext',
                '$location',
                '$q',
                '$stateParams',
                '$state',
                function($rootScope,
                         projectFactory,
                         userContext,
                         $location,
                         $q,
                         $stateParams,
                         $state) {
                  var deferred = $q.defer(),
                    token = $stateParams.q;
                  projectFactory.assignInvitedProjectToMember(token)
                    .success(function(){
                      if(userContext.authentication().isAuth) {
                        $location.path($state.href('app.project'));
                      } else {
                        $location.path($state.href('app.signin'));
                      }
                    })
                    .error(function(err){

                    });
                  return deferred.promise;
                }]
            }
          });
      }
    ]
  );

  return module;
});