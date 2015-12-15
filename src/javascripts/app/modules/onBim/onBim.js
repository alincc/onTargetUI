define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    onBimTpl = require('text!./templates/onBim.html'),
    createOrUpdatetpl = require('text!./templates/_createOrUpdate.html'),
    onBimUpdateTpl = require('text!./templates/update.html'),
    onBimDeleteTpl = require('text!./templates/delete.html'),
    createTpl = require('text!./templates/create.html'),
    detailsTpl = require('text!./templates/details.html'),
    updateCtrl = require('./controllers/update'),
    onBimCtrl = require('./controllers/onBim'),
    createCtrl = require('./controllers/create'),
    onBimDeleteCtrl = require('./controllers/delete'),
    onBimDetailsCtrl = require('./controllers/details'),
    onbimTreesDirective = require('./directives/onbimTrees'),
    onbimTreesTpl = require('text!./templates/onbimTrees.html'),
    onbimTypesDirective = require('./directives/onbimTypes'),
    onbimTypesTpl = require('text!./templates/onbimTypes.html'),
    onbimPropertiesDirective = require('./directives/onbimProperties'),
    onbimPropertiesTpl = require('text!./templates/onbimProperties.html'),
    onbimCommentsDirective = require('./directives/onbimComments'),
    onbimCommentsTpl = require('text!./templates/onbimComments.html');
  var module = angular.module('app.onBim', [
    'app.config'
  ]);


  module.run([
    '$templateCache',
    function($templateCache) {
      $templateCache.put('onBim/templates/onBim.html', onBimTpl);
      $templateCache.put('onBim/templates/_createOrUpdate.html', createOrUpdatetpl);
      $templateCache.put('onBim/templates/update.html', onBimUpdateTpl);
      $templateCache.put('onBim/templates/create.html', createTpl);
      $templateCache.put('onBim/templates/delete.html', onBimDeleteTpl);
      $templateCache.put('onBim/templates/details.html', detailsTpl);
      $templateCache.put('onBim/templates/onbimTrees.html', onbimTreesTpl);
      $templateCache.put('onBim/templates/onbimTypes.html', onbimTypesTpl);
      $templateCache.put('onBim/templates/onbimProperties.html', onbimPropertiesTpl);
      $templateCache.put('onBim/templates/onbimComments.html', onbimCommentsTpl);
    }]);

  module.controller('OnBimController', onBimCtrl);
  module.controller('OnBimUpdateController', updateCtrl);
  module.controller('onBimCreateController', createCtrl);
  module.controller('onBimDeleteController', onBimDeleteCtrl);
  module.controller('OnBimDetailsController', onBimDetailsCtrl);

  module.directive('onbimTrees', onbimTreesDirective);
  module.directive('onbimTypes', onbimTypesDirective);
  module.directive('onbimProperties', onbimPropertiesDirective);
  module.directive('onbimComments', onbimCommentsDirective);

  module.config(
    ['$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('app.onBim', {
            url: '/onBim',
            templateUrl: 'onBim/templates/onBim.html',
            controller: 'OnBimController'
          })
          .state('app.onBimCreate', {
            url: '/onBim/create',
            templateUrl: 'onBim/templates/create.html',
            controller: 'onBimCreateController'
          })
          .state('app.onBimUpdate', {
            url: '/onBim/update/:projectId',
            templateUrl: 'onBim/templates/update.html',
            controller: 'OnBimUpdateController',
            resolve: {
              project: [
                '$stateParams',
                '$q',
                'onBimFactory',
                function($stateParams,
                         $q,
                         onBimFactory) {
                  var deferred = $q.defer();
                  onBimFactory.getById($stateParams.projectId)
                    .success(function(resp) {
                      deferred.resolve(resp.projectBimFileDTO);
                    })
                    .error(function() {
                      deferred.reject();
                    });
                  return deferred.promise;
                }
              ]
            }
          })
          .state('app.onBimDetails', {
            url: '/onBim/details/:projectId',
            templateUrl: 'onBim/templates/details.html',
            controller: 'OnBimDetailsController',
            resolve: {
              project: [
                '$stateParams',
                '$q',
                'onBimFactory',
                'toaster',
                function($stateParams,
                         $q,
                         onBimFactory,
                         toaster) {
                  var deferred = $q.defer();
                  onBimFactory.getById($stateParams.projectId)
                    .success(function(resp) {
                      if(resp.projectBimFileDTO.isBimIFCConversionComplete === 'N') {
                        toaster.pop('info','Info','IFC file conversion is in progress. Please try again!');
                        deferred.reject();
                      } else {
                        deferred.resolve(resp.projectBimFileDTO);
                      }
                    })
                    .error(function() {
                      deferred.reject();
                    });
                  return deferred.promise;
                }
              ]
            }
          });
      }
    ]
  );

  return module;
});
