var tests = [];

for(var file in window.__karma__.files) {
  if(window.__karma__.files.hasOwnProperty(file)) {
    if(/Spec\.js$/.test(file)) {
      tests.push(file);
    }
  }
}

requirejs.config({
  // Karma serves files from '/base'
  baseUrl: '/base',
  // runtime paths and shims
  paths: {
    // end of network components
    jQuery: 'src/bower_components/jquery/dist/jquery',
    angular: 'src/bower_components/angular/angular',
    angularMocks: 'src/bower_components/angular-mocks/angular-mocks',
    angularAnimate: 'src/bower_components/angular-animate/angular-animate',
    angularLocalStorage: 'src/bower_components/angularLocalStorage/src/angularLocalStorage',
    angularLoadingBar: 'src/bower_components/angular-loading-bar/src/loading-bar',
    angularSanitize: 'src/bower_components/angular-sanitize/angular-sanitize',
    angularCookies: 'src/bower_components/angular-cookies/angular-cookies',
    angularMessages: "src/bower_components/angular-messages/angular-messages",
    angularResource: "src/bower_components/angular-resource/angular-resource",
    angularBootstrap: "src/bower_components/angular-bootstrap/ui-bootstrap-tpls",
    angularMoment: 'src/bower_components/angular-moment/angular-moment',
    uiRouter: 'src/bower_components/ui-router/release/angular-ui-router',
    moment: 'src/js/momentjs/moment',
    angularTouch: "src/bower_components/angular-touch/angular-touch",
    toaster: "src/bower_components/angularjs-toaster/toaster",
    angularUiEvent: "src/bower_components/angular-ui-event/dist/event",
    ngFileUpload: "src/js/ng-file-upload/dist/ng-file-upload-all",
    angularSvgRoundProgress: "src/bower_components/angular-svg-round-progressbar/src/module",
    autosize: "src/bower_components/autosize/dist/autosize",
    angularUtilsPagination: 'src/bower_components/angular-utils-pagination/dirPagination',

    // The app code itself
    app: 'src/javascripts/app',

    // Requirejs plugin
    text: 'src/bower_components/requirejs-text/text',
    lodash: 'src/bower_components/lodash/lodash',

    // Test dependencies
    chai: 'node_modules/chai/chai',
    "chai-as-promised": 'node_modules/chai-as-promised/lib/chai-as-promised',
    sinon: 'node_modules/sinon/lib/sinon',
    "sinon-chai": 'node_modules/sinon-chai/lib/sinon-chai'
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
    //"angularMoment": {
    //  deps: ['moment', 'angular']
    //},
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
    }
  },

  // ask Require.js to load these files (all our tests)
  deps: tests

  // start test run, once Require.js is done
  //callback: window.__karma__.start
});

require([
  'chai',
  'chai-as-promised',
  'sinon-chai'
], function(chai, chaiaspromised, sinonChai) {
  'use strict';

  window.chai = chai;
  chai.use(chaiaspromised);
  chai.use(sinonChai);

  // window.assert = chai.assert;
  window.expect = chai.expect;
  // should = chai.should();

  require(tests, function() {
    window.__karma__.start();
  });
});
