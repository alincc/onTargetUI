/**
 * Created by aashiskhanal on 10/9/15.
 */
define(function(require) {
  'use strict';
  var angular = require('angular'),
    uiRouter = require('uiRouter'),
    config = require('app/config'),
    template = require('text!./templates/onBIM.html'),
    controller = require('./controllers/onBIM'),

    angularLocalStorage = require('angularLocalStorage'),
    onSiteServiceModule = require('app/common/services/onBIM'),

    angularSanitize = require('angularSanitize'),


    //bimJqss = require('app/bimclient/lib/jquery-1.10.2/jquery-1.10.2.min'),
    bimJqCokie = require('app/bimclient/lib/jquery-1.10.2/jquery.cookie'),
    bimsurfer = require('app/bimclient/api/BIMSURFER'),
    bimscene = require('app/bimclient/lib/scenejs/scenejs'),
    bimSceneBig = require('app/bimclient/api/SceneJS'),
    bimConstants = require('app/bimclient/api/Constants'),
    bimProgress = require('app/bimclient/api/ProgressLoader'),
    bimLight = require('app/bimclient/api/Types/Light'),
    bimAmbient = require('app/bimclient/api/Types/Light/Ambient'),
    bimSun = require('app/bimclient/api/Types/Light/Sun'),
    bimControl = require('app/bimclient/api/Control'),
    bimClickSelect = require('app/bimclient/api/Control/ClickSelect'),
    bimLayerList = require('app/bimclient/api/Control/LayerList'),
    bimProgressbar = require('app/bimclient/api/Control/ProgressBar'),
    bimPickFly = require('app/bimclient/api/Control/PickFlyOrbit'),
    bimObjectTree = require('app/bimclient/api/Control/ObjectTreeView'),
    bimEvent = require('app/bimclient/api/Events'),
    bimStringView = require('app/bimclient/api/StringView'),
    bimGeometryLoader = require('app/bimclient/api/GeometryLoader'),
    bimAsyncStrem = require('app/bimclient/api/AsyncStream'),
    bimDataInput = require('app/bimclient/api/DataInputStream'),
    bimViewer = require('app/bimclient/api/Viewer'),
    bimUtil = require('app/bimclient/api/Util'),
    bimBimserver = require('app/bimclient/js/bimserverapibootstrap'),
    bimString = require('app/bimclient/js/String'),
    bimutils = require('app/bimclient/js/utils'),
    bimCustomJq = require('app/bimclient/lib/jquery-ui-1.10.3.custom/js/jquery-ui-1.10.3.custom'),
    bimTarget = require('app/bimclient/js/onTargetBim');



  var module = angular.module('app.onBIM', ['ui.router', 'app.config', 'common.context.project', 'angularLocalStorage', 'ui.select', 'common.services.file', 'common.services.onBIM', 'common.services.util', 'ngSanitize', 'common.services.permission']);

  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('onBIM/templates/onBIM.html', template);
  }]);

  module.controller('OnBIMController', controller);

  module.config(
    ['$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('app.onBIM', {
            url: '/onBIM',
            templateUrl: 'onBIM/templates/onBIM.html',
            controller: 'OnBIMController',
            reloadOnSearch: false,
            resolve: {
              projectValid: ['$location', 'projectContext', '$q', '$state', '$window', 'permissionFactory', function($location, projectContext, $q, $state, $window, permissionFactory) {
                var deferred = $q.defer();
                if(projectContext.valid() && permissionFactory.checkMenuPermission('ONBIM')) {
                  deferred.resolve();
                } else {
                  $window.location.href = $state.href('app.projectlist');
                }
                return deferred.promise;
              }]
            }
          });
      }
    ]
  );

  return module;
});
