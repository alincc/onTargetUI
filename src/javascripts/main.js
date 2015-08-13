'use strict';
require.config({
  //baseUrl: '.',

  // optimizer configuration
  optimize: 'uglify2',
  preserveLicenseComments: false,
  generateSourceMaps: true,

  uglify2: {
    output: {
      beautify: false
    },
    mangle: false
  },

  // runtime paths and shims
  paths: {
    // end of network components
    jQuery: '../bower_components/jquery/dist/jquery',
    angular: '../bower_components/angular/angular',
    angularMocks: '../bower_components/angular-mocks/angular-mocks',
    angularAnimate: '../bower_components/angular-animate/angular-animate',
    angularLocalStorage: '../bower_components/angularLocalStorage/src/angularLocalStorage',
    angularLoadingBar: '../bower_components/angular-loading-bar/src/loading-bar',
    angularSanitize: '../bower_components/angular-sanitize/angular-sanitize',
    angularCookies: '../bower_components/angular-cookies/angular-cookies',
    angularMessages: "../bower_components/angular-messages/angular-messages",
    angularResource: "../bower_components/angular-resource/angular-resource",
    angularBootstrap: "../bower_components/angular-bootstrap/ui-bootstrap-tpls",
    angularMoment: '../bower_components/angular-moment/angular-moment',
    uiRouter: '../bower_components/ui-router/release/angular-ui-router',
    lodash: '../bower_components/lodash/lodash',
    text: '../bower_components/requirejs-text/text',
    moment: '../js/momentjs/moment',
    angularTouch: "../bower_components/angular-touch/angular-touch",
    toaster: "../bower_components/angularjs-toaster/toaster",
    angularUiEvent: "../bower_components/angular-ui-event/dist/event",
    ngFileUpload: "../bower_components/ng-file-upload/ng-file-upload-all",
    angularSvgRoundProgress: "../bower_components/angular-svg-round-progressbar/src/module",
    autosize: "../bower_components/autosize/dist/autosize",
    angularUtilsPagination: '../bower_components/angular-utils-pagination/dirPagination',
    angularUiMask: '../bower_components/angular-ui-mask/dist/mask',
    ngScrollable:'../bower_components/ng-scrollable/src/ng-scrollable'
  },

  shim: {
    "angular": {
      deps: ["jQuery"],
      exports: "angular"
    },
    "angularMocks": {
      deps: ["angular"]
    },
    "uiRouter": {
      deps: ["angular"]
    },
    "angularLocalStorage": {
      deps: ["angular", "angularCookies"]
    },
    "angularCookies": {
      deps: ["angular"]
    },
    "angularTouch": {
      deps: ["angular"]
    },
    "angularLoadingBar": {
      deps: ["angular"]
    },
    "angularMoment": {
      deps: ['moment', 'angular']
    },
    "angularAnimate": {
      deps: ['angular']
    },
    "angularMessages": {
      deps: ['angular']
    },
    "angularResource": {
      deps: ['angular']
    },
    "angularSanitize": {
      deps: ['angular']
    },
    "toaster": {
      deps: ['angular', 'angularAnimate']
    },
    "angularBootstrap": {
      deps: ['angular']
    },
    "angularUiEvent": {
      deps: ['angular']
    },
    "ngFileUpload": {
      deps: ['angular']
    },
    "angularSvgRoundProgress": {
      deps: ['angular']
    },
    "angularUtilsPagination": {
      deps: ['angular']
    },
    "angularUiMask": {
      deps: ['angular']
    },
    "ngScrollable": {
      deps: ['angular']
    }
  }
});

// IE console issue when the developer tools are not opened.
//Ensures there will be no 'console is undefined' errors
if(!window.console) {
  window.console = window.console || (function() {
      var c = {};
      c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile = c.clear = c.exception = c.trace = c.assert = function() {
      };
      return c;
    })();
}

require([
  'jQuery',
  'angular',
  'app/app'
], function(jQuery, angular, app) {

  var $html = angular.element(document.getElementsByTagName('html')[0]);
  angular.element().ready(function() {
    //$html.addClass('ng-app');
    angular.bootstrap($html, [app.name]);
  });
});
