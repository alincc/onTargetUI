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
    jQueryMouseWheel: '../bower_components/jquery-mousewheel/jquery.mousewheel',
    jQueryCustomScroll: '../bower_components/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar',

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
    angularMoment: '../js/angular-moment/angular-moment',
    uiRouter: '../bower_components/ui-router/release/angular-ui-router',
    lodash: '../bower_components/lodash/lodash',
    text: '../bower_components/requirejs-text/text',
    async: '../bower_components/requirejs-plugins/src/async',
    //moment: '../js/momentjs/moment',
    moment: '../bower_components/moment/moment',
    angularTouch: "../bower_components/angular-touch/angular-touch",
    toaster: "../bower_components/angularjs-toaster/toaster",
    angularUiEvent: "../bower_components/angular-ui-event/dist/event",
    ngFileUpload: "../bower_components/ng-file-upload/ng-file-upload-all",
    angularSvgRoundProgress: "../bower_components/angular-svg-round-progressbar/build/roundProgress",
    autosize: "../bower_components/autosize/dist/autosize",
    angularUtilsPagination: '../bower_components/angular-utils-pagination/dirPagination',
    angularUiMask: '../bower_components/angular-ui-mask/dist/mask',
    angularUiSelect: '../bower_components/angular-ui-select/dist/select',
    mentio: '../bower_components/ment.io/dist/mentio',
    typeahead: '../bower_components/angular-bootstrap/ui-bootstrap-tpls',
    ngLetterAvatar: '../bower_components/ngletteravatar/ngletteravatar',
    angularGantt: '../bower_components/angular-gantt/assets/angular-gantt',
    angularGanttPlugin: '../bower_components/angular-gantt/assets/angular-gantt-plugins',
    angularUiTree: '../bower_components/angular-ui-tree/dist/angular-ui-tree',
    pusher: '../bower_components/pusher/dist/pusher',
    pushAngular: '../bower_components/pusher-angular/lib/pusher-angular',
    jPlot: '../bower_components/flot/jquery.flot',
    jPlotPie: '../bower_components/flot/jquery.flot.pie',
    jPlotResize: '../bower_components/flot/jquery.flot.resize',
    jPlotCategories: '../bower_components/flot/jquery.flot.categories',
    jPlotToolTip: '../bower_components/flot.tooltip/js/jquery.flot.tooltip',
    jPlotOrderBar: '../bower_components/flot.orderbars/js/jquery.flot.orderBars',
    jPlotSpline: '../bower_components/flot-spline/js/jquery.flot.spline',
    spin: '../js/ladda/js/spin',
    ladda: '../js/ladda/js/ladda',
    leaflet: '../bower_components/leaflet/dist/leaflet-src',
    leafletDraw: '../bower_components/leaflet.draw/dist/leaflet.draw',
    leafletFullScreen: '../bower_components/leaflet.fullscreen/Control.FullScreen',
    cryptorJs: '../bower_components/crypto-js/crypto-js',
    angularChart: '../bower_components/angular-chart.js/dist/angular-chart',
    chartjs: '../bower_components/Chart.js/Chart',
    'jquery.ui.widget': '../js/bim/jquery.ui.widget',
    jqueryUpload: '../js/bim/jquery.fileupload',
    History: '../js/bim/history.adapter.jquery',
    jqueryScrollTo: '../js/bim/jquery.scrollto',
    bimsurfer: '../js/bim/bimsurfer/api/BIMSURFER',
    bimsurferEvents: '../js/bim/bimsurfer/api/Events',
    bimsurferViewer: '../js/bim/bimsurfer/api/Viewer',
    ngTable: '../bower_components/ng-table/dist/ng-table',
    // 3D model viewer libraries
    assimpJsonLoader: '../js/modelViewer/AssimpJSONLoader',
    deviceOrientationControls: '../js/modelViewer/DeviceOrientationControls',
    helvetiker_regular_typeface: '../js/modelViewer/helvetiker_regular.typeface',
    orbitControl: '../js/modelViewer/OrbitControls',
    stats: '../js/modelViewer/Stats',
    stereoEffect: '../js/modelViewer/StereoEffect',
    three: '../js/modelViewer/three',
    tween: '../js/modelViewer/Tween',
    // tree view
    jstree: '../bower_components/jstree/dist/jstree',
    bootstrapDatepicker: '../bower_components/eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker',
    bootstrap: '../bower_components/bootstrap/dist/js/bootstrap',
    select2: '../bower_components/select2/dist/js/select2'
  },

  shim: {
    "jQuery": {
      exports: "jQuery"
    },
    "jQueryMouseWheel": {
      deps: ["jQuery"]
    },
    "jQueryCustomScroll": {
      deps: ["jQuery", "jQueryMouseWheel"]
    },
    "jPlot": {
      deps: ["jQuery"]
    },
    "jPlotPie": {
      deps: ["jPlot"]
    },
    "jPlotResize": {
      deps: ["jPlot"]
    },
    "jPlotCategories": {
      deps: ["jPlot"]
    },
    "jPlotToolTip": {
      deps: ["jPlot"]
    },
    "jPlotOrderBar": {
      deps: ["jPlot"]
    },
    "jPlotSpline": {
      deps: ["jPlot"]
    },
    "ladda": {
      deps: ["spin"]
    },
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
      deps: ['angular', 'moment']
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
    "mentio": {
      deps: ['angular']
    },
    "angularUiSelect": {
      deps: ['angular']
    },
    "angularGantt": {
      deps: ['angularMoment']
    },
    "angularGanttPlugin": {
      deps: ['angularGantt']
    },
    "ngLetterAvatar": {
      deps: ['angular']
    },
    "angularUiTree": {
      deps: ['angular']
    },
    "pushAngular": {
      deps: ['pusher', 'angular']
    },
    "leafletDraw": {
      deps: ['leaflet']
    },
    "leafletFullScreen": {
      deps: ['leaflet']
    },
    "angularChart": {
      deps: ['angular', 'chartjs']
    },
    "jquery.ui.widget": {
      deps: ['jQuery']
    },
    "jqueryUpload": {
      deps: ['jQuery', 'jquery.ui.widget']
    },
    "jqueryScrollTo": {
      deps: ['jQuery']
    },
    "bimsurferEvents": {
      deps: ['bimsurfer']
    },
    "bimsurferViewer": {
      deps: ['bimsurferEvents']
    },
    "ngTable": {
      deps: ['angular']
    },
    deviceOrientationControls: {deps: ['three']},
    orbitControl: {deps: ['three']},
    stereoEffect: {deps: ['three']},
    assimpJsonLoader: {deps: ['three']},
    helvetiker_regular_typeface: {deps: ['three']},
    jstree: {deps: ['jQuery']},
    bootstrapDatepicker: {deps: ['jQuery', 'bootstrap']},
    select2: {deps: ['jQuery']}
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


