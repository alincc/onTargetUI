var gulp = require('gulp');
var path = require('path');
var concat = require('gulp-concat');
var less = require('gulp-less');
var connect = require('gulp-connect');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var open = require('open');
var jshint = require('gulp-jshint');
var karma = require('gulp-karma');
var uglify = require('gulp-uglify');
var replace = require('gulp-replace');
var shell = require('gulp-shell');
var del = require('del');
var ftp = require('vinyl-ftp');
var config = require('./config');

var paths = {
  less: ['./src/less/**/*.less']
};

// Combine lesses
gulp.task('less', ['lint'], function() {
  return gulp.src('./src/less/main.less')
    .pipe(less())
    .pipe(gulp.dest('./src/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({extname: '.min.css'}))
    .pipe(gulp.dest('./src/css/'));
});

gulp.task('lessOnly', function() {
  return gulp.src('./src/less/main.less')
    .pipe(less())
    .pipe(gulp.dest('./src/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({extname: '.min.css'}))
    .pipe(gulp.dest('./src/css/'));
});

// Copy Fonts
gulp.task('fonts:awesome', function() {
  return gulp.src([
    './src/bower_components/components-font-awesome/fonts/*'
  ]).pipe(gulp.dest('./build/fonts/'));
});

gulp.task('fonts:bootstrap', function() {
  return gulp.src([
    './src/bower_components/bootstrap-css-only/fonts/*'
  ]).pipe(gulp.dest('./build/fonts/'));
});

gulp.task('fonts', ['fonts:awesome', 'fonts:bootstrap', 'less'], function() {
  return gulp.src([
    './src/fonts/*',
    './src/fonts/*/*'])
    .pipe(gulp.dest('./build/fonts/'));
});

// Copy Images
gulp.task('images', ['fonts'], function() {
  return gulp.src([
    './src/img/**/*'])
    .pipe(gulp.dest('./build/img/'));
});

// Copy js to build
gulp.task('script:requirejs', function() {
  return gulp.src([
    './src/bower_components/requirejs/*',
    './src/bower_components/requirejs/**/*.*'])
    .pipe(gulp.dest('./build/bower_components/requirejs'));
});

gulp.task('resources', function() {
  return gulp.src([
    './src/javascripts/app/common/resources/**/*.json'])
    .pipe(gulp.dest('./build/javascripts/app/common/resources'));
});

gulp.task('templates', function() {
  return gulp.src([
    './src/javascripts/app/common/templates/**/*'])
    .pipe(gulp.dest('./build/javascripts/app/common/templates'));
});

gulp.task('bimProjectData', function() {
  return gulp.src([
    './src/javascripts/app/modules/bimProject/**/*.html',
    './src/javascripts/app/modules/bimProject/**/*.version'])
    .pipe(gulp.dest('./build/javascripts/app/modules/bimProject'));
});

gulp.task('script', ['script:requirejs', 'resources', 'templates', 'bimProjectData', 'images'], function() {
  return gulp.src([
    './src/js/**/*'])
    .pipe(gulp.dest('./build/js'));
});

// Copy index.html, rename main and css file
gulp.task('html', ['script'], function() {
  return gulp.src([
    './src/index.html'])
    .pipe(replace('javascripts/main', 'javascripts/main.min'))
    .pipe(replace('css/main.css', 'css/main.min.css'))
    .pipe(gulp.dest('./build/'));
});

// Copy css
gulp.task('BIMCss', function() {
  return gulp.src([
    'src/css/**/*',
    '!src/css/main.css',
    '!src/css/main.min.css'
  ])
    .pipe(gulp.dest('build/css'));
});

// Copy css
gulp.task('css', ['html', 'BIMCss'], function() {
  return gulp.src('src/css/main.min.css')
    .pipe(gulp.dest('build/css'));
});

// Jshint
gulp.task('lint', function() {
  return gulp.src([
    './src/javascripts/app/common/**/*.js',
    './src/javascripts/app/common/**/**/*.js',
    './src/javascripts/app/modules/*.js',
    './src/javascripts/app/modules/**/*.js',
    './src/javascripts/app/modules/**/**/*.js'
  ])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

// RequireJS Optimization
// Window r.js command line fix (It conflict between r.js and r.cmd.js)
// del %HOMEDRIVE%%HOMEPATH%\AppData\Roaming\npm\r.js
// del node_modules\.bin\r.js
gulp.task('requireJsOptimizer', ['css'], shell.task([
  // This is the command
  'r.js -o src/javascripts/build.js'
]));

// Watch
gulp.task('watch', function() {
  // Watch for changes in `app` folder
  gulp.watch([
    './src/less/**/*.css',
    './src/less/**/*.less',
    './src/less/*.less',
    './src/javascripts/app/common/**/*.js',
    './src/javascripts/app/common/**/**/*.js',
    './src/javascripts/app/modules/*.js',
    './src/javascripts/app/modules/**/*.js',
    './src/javascripts/app/modules/**/**/*.js',
    './src/javascripts/app/modules/**/*.html',
    './src/javascripts/app/modules/**/**/*.html'
  ], ['lint', 'less']);
});

// Watch CSS
gulp.task('watchCSS', function() {
  // Watch for changes in `app` folder
  gulp.watch([
    './src/less/**/*.css',
    './src/less/**/*.less',
    './src/less/*.less'
  ], ['lessOnly']);
});

// Test task
gulp.task('test', ['lint'], function() {
  // Be sure to return the stream
  return gulp.src([
    'undefined.js' // https://github.com/lazd/gulp-karma/issues/7
  ])
    .pipe(karma({
      configFile: './karma.conf.js',
      action: 'run'
    }))
    .on('error', function(err) {
      // Make sure failed tests cause gulp to exit non-zero
      throw err;
    });
});

////////////////////////////////////
///////// BUILD TASKS //////////////
///////////////////////////////////

// Common build
gulp.task('build', ['requireJsOptimizer'], function() {
  // move main script file
  return gulp.src('src/javascripts/main.min.js')
    .pipe(replace(/domain: '.*'/, "domain: '" + config.default.domain + "'")) // domain
    .pipe(replace(/baseUrl: '.*'/, "baseUrl: '" + config.default.baseUrl + "'")) // base url
    .pipe(replace(/nodeServer: '.*'/, "nodeServer: '" + config.default.nodeServer + "'")) // node server domain
    .pipe(replace(/resourceUrl: '.*'/, "resourceUrl: '" + config.default.resourceUrl + "'"))
    .pipe(replace(/bimServer: '.*'/, "bimServer: '" + config.default.baseUrl + "/bim'"))
    .pipe(replace(/bimServerAddress: '.*'/, "bimServerAddress: '" + config.default.bimServerAddress + "'"))
    .pipe(replace(/bim_user: '.*'/, "bim_user: '" + config.default.bimCredential.username + "'"))
    .pipe(replace(/bim_password: '.*'/, "bim_password: '" + config.default.bimCredential.password + "'"))
    .pipe(replace(/pusher_api_key: '.*'/, "pusher_api_key: '" + config.default.pusher.apiKey + "'"))
    .pipe(gulp.dest('build/javascripts'));

  del([
    'build/javascripts/main.js',
    'build/javascripts/build.js'
  ]);
});

// Environment builds

// ---- Local -----
gulp.task('build:local', ['build'], function() {
  // Copy all file in build folder
  gulp.src(['./build/**/*', '!./build/javascripts/main.min.js'])
    .pipe(gulp.dest('./build-local/app'));

  // modify and minify
  gulp.src(['./src/javascripts/main.min.js'])
    .pipe(replace(/domain: '.*'/, "domain: '" + config.local.domain + "'")) // domain
    .pipe(replace(/baseUrl: '.*'/, "baseUrl: '" + config.local.baseUrl + "'")) // base url
    .pipe(replace(/nodeServer: '.*'/, "nodeServer: '" + config.local.nodeServer + "'")) // node server domain
    .pipe(replace(/resourceUrl: '.*'/, "resourceUrl: '" + config.local.resourceUrl + "'"))
    .pipe(replace(/bimServer: '.*'/, "bimServer: '" + config.local.baseUrl + "/bim'"))
    .pipe(replace(/bimServerAddress: '.*'/, "bimServerAddress: '" + config.local.bimServerAddress + "'"))
    .pipe(replace(/bim_user: '.*'/, "bim_user: '" + config.local.bimCredential.username + "'"))
    .pipe(replace(/bim_password: '.*'/, "bim_password: '" + config.local.bimCredential.password + "'"))
    .pipe(replace(/pusher_api_key: '.*'/, "pusher_api_key: '" + config.local.pusher.apiKey + "'"))
    .pipe(replace(/weatherUrl: '.*'/, "weatherUrl: '" + config.local.weatherUrl + "'"))
    .pipe(uglify())
    .pipe(gulp.dest('./build-local/app/javascripts'));

  // Copy app.js and modify value
  gulp.src('./app.js')
    .pipe(replace(/myArgs\[1\]\s\|\|\s3214/, "myArgs[1] || " + config.local.port))
    .pipe(replace(/API_SERVER\s=\s'.*'/, "API_SERVER = '" + config.local.API_SERVER + "'"))
    .pipe(replace(/BIM_SERVER\s=\s'.*'/, "BIM_SERVER = '" + config.local.BIM_SERVER + "'"))
    .pipe(replace(/pusher_appId\s=\s'(.*)'/g, 'pusher_appId = \'' + config.local.pusher.appId + '\''))
    .pipe(replace(/pusher_key\s=\s'(.*)'/g, 'pusher_key = \'' + config.local.pusher.apiKey + '\''))
    .pipe(replace(/pusher_secret\s=\s'(.*)'/g, 'pusher_secret = \'' + config.local.pusher.secret + '\''))
    .pipe(gulp.dest('./build-local'));

  gulp.src('./package.app.json')
    .pipe(rename('./package.json'))
    .pipe(gulp.dest('./build-local'));
});

// ---- Integration -----
gulp.task('build:integration', ['build'], function() {
  // Copy all file in build folder
  gulp.src(['./build/**/*', '!./build/javascripts/main.min.js'])
    .pipe(gulp.dest('./build-integration/app'));

  // minify
  gulp.src(['./src/javascripts/main.min.js'])
    .pipe(replace(/domain: '.*'/, "domain: '" + config.integration.domain + "'")) // domain
    .pipe(replace(/baseUrl: '.*'/, "baseUrl: '" + config.integration.baseUrl + "'")) // base url
    .pipe(replace(/nodeServer: '.*'/, "nodeServer: '" + config.integration.nodeServer + "'")) // node server domain
    .pipe(replace(/resourceUrl: '.*'/, "resourceUrl: '" + config.integration.resourceUrl + "'"))
    .pipe(replace(/bimServer: '.*'/, "bimServer: '" + config.integration.baseUrl + "/bim'"))
    .pipe(replace(/bimServerAddress: '.*'/, "bimServerAddress: '" + config.integration.bimServerAddress + "'"))
    .pipe(replace(/bim_user: '.*'/, "bim_user: '" + config.integration.bimCredential.username + "'"))
    .pipe(replace(/bim_password: '.*'/, "bim_password: '" + config.integration.bimCredential.password + "'"))
    .pipe(replace(/pusher_api_key: '.*'/, "pusher_api_key: '" + config.integration.pusher.apiKey + "'"))
    .pipe(replace(/weatherUrl: '.*'/, "weatherUrl: '" + config.integration.weatherUrl + "'"))
    .pipe(uglify())
    .pipe(gulp.dest('./build-integration/app/javascripts'));

  // Copy app.js and modify value
  gulp.src('./app.js')
    .pipe(replace(/myArgs\[1\]\s\|\|\s3214/, "myArgs[1] || " + config.integration.port))
    .pipe(replace(/API_SERVER\s=\s'.*'/, "API_SERVER = '" + config.integration.API_SERVER + "'"))
    .pipe(replace(/BIM_SERVER\s=\s'.*'/, "BIM_SERVER = '" + config.integration.BIM_SERVER + "'"))
    .pipe(replace(/pusher_appId\s=\s'(.*)'/g, 'pusher_appId = \'' + config.integration.pusher.appId + '\''))
    .pipe(replace(/pusher_key\s=\s'(.*)'/g, 'pusher_key = \'' + config.integration.pusher.apiKey + '\''))
    .pipe(replace(/pusher_secret\s=\s'(.*)'/g, 'pusher_secret = \'' + config.integration.pusher.secret + '\''))
    .pipe(gulp.dest('./build-integration'));

  gulp.src('./package.app.json')
    .pipe(rename('./package.json'))
    .pipe(gulp.dest('./build-integration'));
});

// ---- Integration -----
gulp.task('build:beta', ['build'], function() {
  // Copy all file in build folder
  gulp.src(['./build/**/*', '!./build/javascripts/main.min.js'])
    .pipe(gulp.dest('./build-beta/app'));

  // minify
  gulp.src(['./src/javascripts/main.min.js'])
    .pipe(replace(/domain: '.*'/, "domain: '" + config.beta.domain + "'")) // domain
    .pipe(replace(/baseUrl: '.*'/, "baseUrl: '" + config.beta.baseUrl + "'")) // base url
    .pipe(replace(/nodeServer: '.*'/, "nodeServer: '" + config.beta.nodeServer + "'")) // node server domain
    .pipe(replace(/resourceUrl: '.*'/, "resourceUrl: '" + config.beta.resourceUrl + "'"))
    .pipe(replace(/bimServer: '.*'/, "bimServer: '" + config.beta.baseUrl + "/bim'"))
    .pipe(replace(/bimServerAddress: '.*'/, "bimServerAddress: '" + config.beta.bimServerAddress + "'"))
    .pipe(replace(/bim_user: '.*'/, "bim_user: '" + config.beta.bimCredential.username + "'"))
    .pipe(replace(/bim_password: '.*'/, "bim_password: '" + config.beta.bimCredential.password + "'"))
    .pipe(replace(/pusher_api_key: '.*'/, "pusher_api_key: '" + config.beta.pusher.apiKey + "'"))
    .pipe(replace(/weatherUrl: '.*'/, "weatherUrl: '" + config.beta.weatherUrl + "'"))
    .pipe(uglify())
    .pipe(gulp.dest('./build-beta/app/javascripts'));

  // Copy app.js and modify value
  gulp.src('./app.js')
    .pipe(replace(/myArgs\[1\]\s\|\|\s3214/, "myArgs[1] || " + config.beta.port))
    .pipe(replace(/API_SERVER\s=\s'.*'/, "API_SERVER = '" + config.beta.API_SERVER + "'"))
    .pipe(replace(/BIM_SERVER\s=\s'.*'/, "BIM_SERVER = '" + config.beta.BIM_SERVER + "'"))
    .pipe(replace(/pusher_appId\s=\s'(.*)'/g, 'pusher_appId = \'' + config.beta.pusher.appId + '\''))
    .pipe(replace(/pusher_key\s=\s'(.*)'/g, 'pusher_key = \'' + config.beta.pusher.apiKey + '\''))
    .pipe(replace(/pusher_secret\s=\s'(.*)'/g, 'pusher_secret = \'' + config.beta.pusher.secret + '\''))
    .pipe(gulp.dest('./build-beta'));

  gulp.src('./package.app.json')
    .pipe(rename('./package.json'))
    .pipe(gulp.dest('./build-beta'));
});


// ---- Testing -----
gulp.task('build:testing', ['build'], function() {
  // Copy all file in build folder
  gulp.src(['./build/**/*', '!./build/javascripts/main.min.js'])
    .pipe(gulp.dest('./build-testing/app'));

  // minify
  gulp.src(['./src/javascripts/main.min.js'])
    .pipe(replace(/domain: '.*'/, "domain: '" + config.testing.domain + "'")) // domain
    .pipe(replace(/baseUrl: '.*'/, "baseUrl: '" + config.testing.baseUrl + "'")) // base url
    .pipe(replace(/nodeServer: '.*'/, "nodeServer: '" + config.testing.nodeServer + "'")) // node server domain
    .pipe(replace(/resourceUrl: '.*'/, "resourceUrl: '" + config.testing.resourceUrl + "'"))
    .pipe(replace(/bimServer: '.*'/, "bimServer: '" + config.testing.baseUrl + "/bim'"))
    .pipe(replace(/bimServerAddress: '.*'/, "bimServerAddress: '" + config.testing.bimServerAddress + "'"))
    .pipe(replace(/bim_user: '.*'/, "bim_user: '" + config.testing.bimCredential.username + "'"))
    .pipe(replace(/bim_password: '.*'/, "bim_password: '" + config.testing.bimCredential.password + "'"))
    .pipe(replace(/pusher_api_key: '.*'/, "pusher_api_key: '" + config.testing.pusher.apiKey + "'"))
    .pipe(replace(/weatherUrl: '.*'/, "weatherUrl: '" + config.testing.weatherUrl + "'"))
    .pipe(uglify())
    .pipe(gulp.dest('./build-testing/app/javascripts'));

  // Copy app.js and modify value
  gulp.src('./app.js')
    .pipe(replace(/myArgs\[1\]\s\|\|\s3214/, "myArgs[1] || " + config.testing.port))
    .pipe(replace(/API_SERVER\s=\s'.*'/, "API_SERVER = '" + config.testing.API_SERVER + "'"))
    .pipe(replace(/BIM_SERVER\s=\s'.*'/, "BIM_SERVER = '" + config.testing.BIM_SERVER + "'"))
    .pipe(replace(/pusher_appId\s=\s'(.*)'/g, 'pusher_appId = \'' + config.testing.pusher.appId + '\''))
    .pipe(replace(/pusher_key\s=\s'(.*)'/g, 'pusher_key = \'' + config.testing.pusher.apiKey + '\''))
    .pipe(replace(/pusher_secret\s=\s'(.*)'/g, 'pusher_secret = \'' + config.testing.pusher.secret + '\''))
    .pipe(gulp.dest('./build-testing'));

  gulp.src('./package.app.json')
    .pipe(rename('./package.json'))
    .pipe(gulp.dest('./build-testing'));
});

// ---- Staging -----
gulp.task('build:staging', ['build'], function() {
  // Copy all file in build folder
  gulp.src(['./build/**/*', '!./build/javascripts/main.min.js'])
    .pipe(gulp.dest('./build-staging/app'));

  // minify
  gulp.src(['./src/javascripts/main.min.js'])
    .pipe(replace(/domain: '.*'/, "domain: '" + config.staging.domain + "'")) // domain
    .pipe(replace(/baseUrl: '.*'/, "baseUrl: '" + config.staging.baseUrl + "'")) // base url
    .pipe(replace(/nodeServer: '.*'/, "nodeServer: '" + config.staging.nodeServer + "'")) // node server domain
    .pipe(replace(/resourceUrl: '.*'/, "resourceUrl: '" + config.staging.resourceUrl + "'"))
    .pipe(replace(/bimServer: '.*'/, "bimServer: '" + config.staging.baseUrl + "/bim'"))
    .pipe(replace(/bimServerAddress: '.*'/, "bimServerAddress: '" + config.staging.bimServerAddress + "'"))
    .pipe(replace(/bim_user: '.*'/, "bim_user: '" + config.staging.bimCredential.username + "'"))
    .pipe(replace(/bim_password: '.*'/, "bim_password: '" + config.staging.bimCredential.password + "'"))
    .pipe(replace(/pusher_api_key: '.*'/, "pusher_api_key: '" + config.staging.pusher.apiKey + "'"))
    .pipe(replace(/weatherUrl: '.*'/, "weatherUrl: '" + config.staging.weatherUrl + "'"))
    .pipe(uglify())
    .pipe(gulp.dest('./build-staging/app/javascripts'));

  // Copy app.js and modify value
  gulp.src('./app.js')
    .pipe(replace(/myArgs\[1\]\s\|\|\s3214/, "myArgs[1] || " + config.staging.port))
    .pipe(replace(/API_SERVER\s=\s'.*'/, "API_SERVER = '" + config.staging.API_SERVER + "'"))
    .pipe(replace(/BIM_SERVER\s=\s'.*'/, "BIM_SERVER = '" + config.staging.BIM_SERVER + "'"))
    .pipe(replace(/pusher_appId\s=\s'(.*)'/g, 'pusher_appId = \'' + config.staging.pusher.appId + '\''))
    .pipe(replace(/pusher_key\s=\s'(.*)'/g, 'pusher_key = \'' + config.staging.pusher.apiKey + '\''))
    .pipe(replace(/pusher_secret\s=\s'(.*)'/g, 'pusher_secret = \'' + config.staging.pusher.secret + '\''))
    .pipe(gulp.dest('./build-staging'));

  gulp.src('./package.app.json')
    .pipe(rename('./package.json'))
    .pipe(gulp.dest('./build-staging'));
});

// ---- Production -----
gulp.task('build:production', ['build'], function() {
  // Copy all file in build folder
  gulp.src(['./build/**/*', '!./build/javascripts/main.min.js'])
    .pipe(gulp.dest('./build-production/app'));

  // minify
  gulp.src(['./src/javascripts/main.min.js'])
    .pipe(replace(/domain: '.*'/, "domain: '" + config.production.domain + "'")) // domain
    .pipe(replace(/baseUrl: '.*'/, "baseUrl: '" + config.production.baseUrl + "'")) // base url
    .pipe(replace(/nodeServer: '.*'/, "nodeServer: '" + config.production.nodeServer + "'")) // node server domain
    .pipe(replace(/resourceUrl: '.*'/, "resourceUrl: '" + config.production.resourceUrl + "'"))
    .pipe(replace(/bimServer: '.*'/, "bimServer: '" + config.production.baseUrl + "/bim'"))
    .pipe(replace(/bimServerAddress: '.*'/, "bimServerAddress: '" + config.production.bimServerAddress + "'"))
    .pipe(replace(/bim_user: '.*'/, "bim_user: '" + config.production.bimCredential.username + "'"))
    .pipe(replace(/bim_password: '.*'/, "bim_password: '" + config.production.bimCredential.password + "'"))
    .pipe(replace(/pusher_api_key: '.*'/, "pusher_api_key: '" + config.production.pusher.apiKey + "'"))
    .pipe(replace(/weatherUrl: '.*'/, "weatherUrl: '" + config.production.weatherUrl + "'"))
    .pipe(uglify())
    .pipe(gulp.dest('./build-production/app/javascripts'));

  // Copy app.js and modify value
  gulp.src('./app.js')
    .pipe(replace(/myArgs\[1\]\s\|\|\s3214/, "myArgs[1] || " + config.production.port))
    .pipe(replace(/API_SERVER\s=\s'.*'/, "API_SERVER = '" + config.production.API_SERVER + "'"))
    .pipe(replace(/BIM_SERVER\s=\s'.*'/, "BIM_SERVER = '" + config.production.BIM_SERVER + "'"))
    .pipe(replace(/pusher_appId\s=\s'(.*)'/g, 'pusher_appId = \'' + config.production.pusher.appId + '\''))
    .pipe(replace(/pusher_key\s=\s'(.*)'/g, 'pusher_key = \'' + config.production.pusher.apiKey + '\''))
    .pipe(replace(/pusher_secret\s=\s'(.*)'/g, 'pusher_secret = \'' + config.production.pusher.secret + '\''))
    .pipe(gulp.dest('./build-production'));

  gulp.src('./package.app.json')
    .pipe(rename('./package.json'))
    .pipe(gulp.dest('./build-production'));
});

// ---- Production - sagarmatha01 -----
gulp.task('build:sagarmatha01', ['build'], function() {
  // Copy all file in build folder
  gulp.src(['./build/**/*', '!./build/javascripts/main.min.js'])
    .pipe(gulp.dest('./build-sagarmatha01/app'));

  // minify
  gulp.src(['./src/javascripts/main.min.js'])
    .pipe(replace(/domain: '.*'/, "domain: '" + config.sagarmatha01.domain + "'")) // domain
    .pipe(replace(/baseUrl: '.*'/, "baseUrl: '" + config.sagarmatha01.baseUrl + "'")) // base url
    .pipe(replace(/nodeServer: '.*'/, "nodeServer: '" + config.sagarmatha01.nodeServer + "'")) // node server domain
    .pipe(replace(/resourceUrl: '.*'/, "resourceUrl: '" + config.sagarmatha01.resourceUrl + "'"))
    .pipe(replace(/bimServer: '.*'/, "bimServer: '" + config.sagarmatha01.baseUrl + "/bim'"))
    .pipe(replace(/bimServerAddress: '.*'/, "bimServerAddress: '" + config.sagarmatha01.bimServerAddress + "'"))
    .pipe(replace(/bim_user: '.*'/, "bim_user: '" + config.sagarmatha01.bimCredential.username + "'"))
    .pipe(replace(/bim_password: '.*'/, "bim_password: '" + config.sagarmatha01.bimCredential.password + "'"))
    .pipe(replace(/pusher_api_key: '.*'/, "pusher_api_key: '" + config.sagarmatha01.pusher.apiKey + "'"))
    .pipe(replace(/weatherUrl: '.*'/, "weatherUrl: '" + config.sagarmatha01.weatherUrl + "'"))
    .pipe(uglify())
    .pipe(gulp.dest('./build-sagarmatha01/app/javascripts'));

  // Copy app.js and modify value
  gulp.src('./app.js')
    .pipe(replace(/myArgs\[1\]\s\|\|\s3214/, "myArgs[1] || " + config.sagarmatha01.port))
    .pipe(replace(/API_SERVER\s=\s'.*'/, "API_SERVER = '" + config.sagarmatha01.API_SERVER + "'"))
    .pipe(replace(/BIM_SERVER\s=\s'.*'/, "BIM_SERVER = '" + config.sagarmatha01.BIM_SERVER + "'"))
    .pipe(replace(/pusher_appId\s=\s'(.*)'/g, 'pusher_appId = \'' + config.sagarmatha01.pusher.appId + '\''))
    .pipe(replace(/pusher_key\s=\s'(.*)'/g, 'pusher_key = \'' + config.sagarmatha01.pusher.apiKey + '\''))
    .pipe(replace(/pusher_secret\s=\s'(.*)'/g, 'pusher_secret = \'' + config.sagarmatha01.pusher.secret + '\''))
    .pipe(gulp.dest('./build-sagarmatha01'));

  gulp.src('./package.app.json')
    .pipe(rename('./package.json'))
    .pipe(gulp.dest('./build-sagarmatha01'));
});

// ---- Production sagarmatha 02 -----
gulp.task('build:sagarmatha02', ['build'], function() {
  // Copy all file in build folder
  gulp.src(['./build/**/*', '!./build/javascripts/main.min.js'])
    .pipe(gulp.dest('./build-sagarmatha02/app'));

  // minify
  gulp.src(['./src/javascripts/main.min.js'])
    .pipe(replace(/domain: '.*'/, "domain: '" + config.sagarmatha02.domain + "'")) // domain
    .pipe(replace(/baseUrl: '.*'/, "baseUrl: '" + config.sagarmatha02.baseUrl + "'")) // base url
    .pipe(replace(/nodeServer: '.*'/, "nodeServer: '" + config.sagarmatha02.nodeServer + "'")) // node server domain
    .pipe(replace(/resourceUrl: '.*'/, "resourceUrl: '" + config.sagarmatha02.resourceUrl + "'"))
    .pipe(replace(/bimServer: '.*'/, "bimServer: '" + config.sagarmatha02.baseUrl + "/bim'"))
    .pipe(replace(/bimServerAddress: '.*'/, "bimServerAddress: '" + config.sagarmatha02.bimServerAddress + "'"))
    .pipe(replace(/bim_user: '.*'/, "bim_user: '" + config.sagarmatha02.bimCredential.username + "'"))
    .pipe(replace(/bim_password: '.*'/, "bim_password: '" + config.sagarmatha02.bimCredential.password + "'"))
    .pipe(replace(/pusher_api_key: '.*'/, "pusher_api_key: '" + config.sagarmatha02.pusher.apiKey + "'"))
    .pipe(replace(/weatherUrl: '.*'/, "weatherUrl: '" + config.sagarmatha02.weatherUrl + "'"))
    .pipe(uglify())
    .pipe(gulp.dest('./build-sagarmatha02/app/javascripts'));

  // Copy app.js and modify value
  gulp.src('./app.js')
    .pipe(replace(/myArgs\[1\]\s\|\|\s3214/, "myArgs[1] || " + config.sagarmatha02.port))
    .pipe(replace(/API_SERVER\s=\s'.*'/, "API_SERVER = '" + config.sagarmatha02.API_SERVER + "'"))
    .pipe(replace(/BIM_SERVER\s=\s'.*'/, "BIM_SERVER = '" + config.sagarmatha02.BIM_SERVER + "'"))
    .pipe(replace(/pusher_appId\s=\s'(.*)'/g, 'pusher_appId = \'' + config.sagarmatha02.pusher.appId + '\''))
    .pipe(replace(/pusher_key\s=\s'(.*)'/g, 'pusher_key = \'' + config.sagarmatha02.pusher.apiKey + '\''))
    .pipe(replace(/pusher_secret\s=\s'(.*)'/g, 'pusher_secret = \'' + config.sagarmatha02.pusher.secret + '\''))
    .pipe(gulp.dest('./build-sagarmatha02'));

  gulp.src('./package.app.json')
    .pipe(rename('./package.json'))
    .pipe(gulp.dest('./build-sagarmatha02'));
});

// ---- NOIS -----
gulp.task('build:nois', ['build'], function() {
  // Copy all file in build folder
  gulp.src(['./build/**/*', '!./build/javascripts/main.min.js'])
    .pipe(gulp.dest('./build-nois/app'));

  // modify and minify
  gulp.src(['./src/javascripts/main.min.js'])
    .pipe(replace(/domain: '.*'/, "domain: '" + config.nois.domain + "'")) // domain
    .pipe(replace(/baseUrl: '.*'/, "baseUrl: '" + config.nois.baseUrl + "'")) // base url
    .pipe(replace(/nodeServer: '.*'/, "nodeServer: '" + config.nois.nodeServer + "'")) // node server domain
    .pipe(replace(/resourceUrl: '.*'/, "resourceUrl: '" + config.nois.resourceUrl + "'"))
    .pipe(replace(/bimServer: '.*'/, "bimServer: '" + config.nois.baseUrl + "/bim'"))
    .pipe(replace(/bimServerAddress: '.*'/, "bimServerAddress: '" + config.nois.bimServerAddress + "'"))
    .pipe(replace(/bim_user: '.*'/, "bim_user: '" + config.nois.bimCredential.username + "'"))
    .pipe(replace(/bim_password: '.*'/, "bim_password: '" + config.nois.bimCredential.password + "'"))
    .pipe(replace(/pusher_api_key: '.*'/, "pusher_api_key: '" + config.nois.pusher.apiKey + "'"))
    .pipe(replace(/weatherUrl: '.*'/, "weatherUrl: '" + config.nois.weatherUrl + "'"))
    .pipe(uglify())
    .pipe(gulp.dest('./build-nois/app/javascripts'));

  // Copy app.js and modify value
  gulp.src('./app.js')
    .pipe(replace(/myArgs\[1\]\s\|\|\s3214/, "myArgs[1] || " + config.nois.port))
    .pipe(replace(/API_SERVER\s=\s'.*'/, "API_SERVER = '" + config.nois.API_SERVER + "'"))
    .pipe(replace(/BIM_SERVER\s=\s'.*'/, "BIM_SERVER = '" + config.nois.BIM_SERVER + "'"))
    .pipe(replace(/pusher_appId\s=\s'(.*)'/g, 'pusher_appId = \'' + config.nois.pusher.appId + '\''))
    .pipe(replace(/pusher_key\s=\s'(.*)'/g, 'pusher_key = \'' + config.nois.pusher.apiKey + '\''))
    .pipe(replace(/pusher_secret\s=\s'(.*)'/g, 'pusher_secret = \'' + config.nois.pusher.secret + '\''))
    .pipe(gulp.dest('./build-nois'));

  gulp.src('./package.app.json')
    .pipe(rename('./package.json'))
    .pipe(gulp.dest('./build-nois'));
});

// Server build
gulp.task('build:server', function() {
  gulp.src('package.json', {"base": "."})
    .pipe(replace(/"devDependencies":\s[\s\S]*},/g, '"devDependencies":{},'))
    .pipe(gulp.dest('build-server'));

  gulp.src('server/config.js', {"base": "."})
    .pipe(replace(/PROXY_URL: '(.*)'/g, 'PROXY_URL: \'' + config.server.PROXY_URL + '\''))
    .pipe(replace(/path\.join\(rootPath, '(.*)'\)/g, 'path.join(rootPath, \'' + config.server.assetLocation + '\')'))
    .pipe(replace(/imagePathRoot: '(.*)\/'/g, 'imagePathRoot: \'' + config.server.assetLocation + '\''))
    .pipe(replace(/maxFileSize: \d+/g, 'maxFileSize: ' + config.server.maxFileSize))
    .pipe(replace(/convertCommand: '(.*)'/g, 'convertCommand: \'' + config.server.convertCommand + '\''))
    .pipe(replace(/gsCommand: '(.*)'/g, 'gsCommand: \'' + config.server.gsCommand + '\''))
    .pipe(replace(/concurrencyImageProcesses: \d+/g, 'concurrencyImageProcesses: ' + config.server.concurrencyImageProcesses))
    .pipe(replace(/pusher_appId: '(.*)'/g, 'pusher_appId: \'' + config.server.pusher.appId + '\''))
    .pipe(replace(/pusher_key: '(.*)'/g, 'pusher_key: \'' + config.server.pusher.apiKey + '\''))
    .pipe(replace(/pusher_secret: '(.*)'/g, 'pusher_secret: \'' + config.server.pusher.secret + '\''))
    .pipe(replace(/domain: '(.*)'/g, 'domain: \'' + config.server.domain + '\''))
    .pipe(gulp.dest('build-server'));

  return gulp.src([
    'server/**/*',
    '!server/config.js',
    'server.js'
  ], {"base": "."})
    .pipe(gulp.dest('build-server'));
});


// Server build local
gulp.task('build:serverlocal', function() {
  gulp.src('package.json', {"base": "."})
    .pipe(replace(/"devDependencies":\s[\s\S]*},/g, '"devDependencies":{},'))
    .pipe(gulp.dest('build-server'));

  gulp.src('server/config.js', {"base": "."})
    .pipe(replace(/PROXY_URL: '(.*)'/g, 'PROXY_URL: \'' + config.serverlocal.PROXY_URL + '\''))
    .pipe(replace(/path\.join\(rootPath, '(.*)'\)/g, 'path.join(rootPath, \'' + config.serverlocal.assetLocation + '\')'))
    .pipe(replace(/imagePathRoot: '(.*)\/'/g, 'imagePathRoot: \'' + config.serverlocal.assetLocation + '\''))
    .pipe(replace(/maxFileSize: \d+/g, 'maxFileSize: ' + config.serverlocal.maxFileSize))
    .pipe(replace(/convertCommand: '(.*)'/g, 'convertCommand: \'' + config.serverlocal.convertCommand + '\''))
    .pipe(replace(/gsCommand: '(.*)'/g, 'gsCommand: \'' + config.serverlocal.gsCommand + '\''))
    .pipe(replace(/concurrencyImageProcesses: \d+/g, 'concurrencyImageProcesses: ' + config.serverlocal.concurrencyImageProcesses))
    .pipe(replace(/pusher_appId: '(.*)'/g, 'pusher_appId: \'' + config.serverlocal.pusher.appId + '\''))
    .pipe(replace(/pusher_key: '(.*)'/g, 'pusher_key: \'' + config.serverlocal.pusher.apiKey + '\''))
    .pipe(replace(/pusher_secret: '(.*)'/g, 'pusher_secret: \'' + config.serverlocal.pusher.secret + '\''))
    .pipe(replace(/domain: '(.*)'/g, 'domain: \'' + config.serverlocal.domain + '\''))
    .pipe(gulp.dest('build-server'));

  return gulp.src([
    'server/**/*',
    '!server/config.js',
    'server.js'
  ], {"base": "."})
    .pipe(gulp.dest('build-server'));
});

// Server build local
gulp.task('build:serverintegration', function() {
  gulp.src('package.json', {"base": "."})
    .pipe(replace(/"devDependencies":\s[\s\S]*},/g, '"devDependencies":{},'))
    .pipe(gulp.dest('build-server'));

  gulp.src('server/config.js', {"base": "."})
    .pipe(replace(/PROXY_URL: '(.*)'/g, 'PROXY_URL: \'' + config.serverintegration.PROXY_URL + '\''))
    .pipe(replace(/path\.join\(rootPath, '(.*)'\)/g, 'path.join(rootPath, \'' + config.serverintegration.assetLocation + '\')'))
    .pipe(replace(/imagePathRoot: '(.*)\/'/g, 'imagePathRoot: \'' + config.serverintegration.assetLocation + '\''))
    .pipe(replace(/maxFileSize: \d+/g, 'maxFileSize: ' + config.serverintegration.maxFileSize))
    .pipe(replace(/convertCommand: '(.*)'/g, 'convertCommand: \'' + config.serverintegration.convertCommand + '\''))
    .pipe(replace(/gsCommand: '(.*)'/g, 'gsCommand: \'' + config.serverintegration.gsCommand + '\''))
    .pipe(replace(/concurrencyImageProcesses: \d+/g, 'concurrencyImageProcesses: ' + config.serverintegration.concurrencyImageProcesses))
    .pipe(replace(/pusher_appId: '(.*)'/g, 'pusher_appId: \'' + config.serverintegration.pusher.appId + '\''))
    .pipe(replace(/pusher_key: '(.*)'/g, 'pusher_key: \'' + config.serverintegration.pusher.apiKey + '\''))
    .pipe(replace(/pusher_secret: '(.*)'/g, 'pusher_secret: \'' + config.serverintegration.pusher.secret + '\''))
    .pipe(replace(/domain: '(.*)'/g, 'domain: \'' + config.serverintegration.domain + '\''))
    .pipe(gulp.dest('build-server'));

  return gulp.src([
    'server/**/*',
    '!server/config.js',
    'server.js'
  ], {"base": "."})
    .pipe(gulp.dest('build-server'));
});


// Server build local
gulp.task('build:serverbeta', function() {
  gulp.src('package.json', {"base": "."})
    .pipe(replace(/"devDependencies":\s[\s\S]*},/g, '"devDependencies":{},'))
    .pipe(gulp.dest('build-server-beta'));

  gulp.src('server/config.js', {"base": "."})
    .pipe(replace(/PROXY_URL: '(.*)'/g, 'PROXY_URL: \'' + config.serverbeta.PROXY_URL + '\''))
    .pipe(replace(/path\.join\(rootPath, '(.*)'\)/g, 'path.join(rootPath, \'' + config.serverbeta.assetLocation + '\')'))
    .pipe(replace(/imagePathRoot: '(.*)\/'/g, 'imagePathRoot: \'' + config.serverbeta.assetLocation + '\''))
    .pipe(replace(/maxFileSize: \d+/g, 'maxFileSize: ' + config.serverbeta.maxFileSize))
    .pipe(replace(/convertCommand: '(.*)'/g, 'convertCommand: \'' + config.serverbeta.convertCommand + '\''))
    .pipe(replace(/gsCommand: '(.*)'/g, 'gsCommand: \'' + config.serverbeta.gsCommand + '\''))
    .pipe(replace(/concurrencyImageProcesses: \d+/g, 'concurrencyImageProcesses: ' + config.serverbeta.concurrencyImageProcesses))
    .pipe(replace(/pusher_appId: '(.*)'/g, 'pusher_appId: \'' + config.serverbeta.pusher.appId + '\''))
    .pipe(replace(/pusher_key: '(.*)'/g, 'pusher_key: \'' + config.serverbeta.pusher.apiKey + '\''))
    .pipe(replace(/pusher_secret: '(.*)'/g, 'pusher_secret: \'' + config.serverbeta.pusher.secret + '\''))
    .pipe(replace(/domain: '(.*)'/g, 'domain: \'' + config.serverbeta.domain + '\''))
    .pipe(gulp.dest('build-server-beta'));

  return gulp.src([
    'server/**/*',
    '!server/config.js',
    'server.js'
  ], {"base": "."})
    .pipe(gulp.dest('build-server-beta'));
});


// Server build production - sagarmatha01
gulp.task('build:serversagarmatha01', function() {
  gulp.src('package.json', {"base": "."})
    .pipe(replace(/"devDependencies":\s[\s\S]*},/g, '"devDependencies":{},'))
    .pipe(gulp.dest('build-server-sagarmatha01'));

  gulp.src('server/config.js', {"base": "."})
    .pipe(replace(/PROXY_URL: '(.*)'/g, 'PROXY_URL: \'' + config.serversagarmatha01.PROXY_URL + '\''))
    .pipe(replace(/path\.join\(rootPath, '(.*)'\)/g, 'path.join(rootPath, \'' + config.serversagarmatha01.assetLocation + '\')'))
    .pipe(replace(/imagePathRoot: '(.*)\/'/g, 'imagePathRoot: \'' + config.serversagarmatha01.assetLocation + '\''))
    .pipe(replace(/maxFileSize: \d+/g, 'maxFileSize: ' + config.serversagarmatha01.maxFileSize))
    .pipe(replace(/convertCommand: '(.*)'/g, 'convertCommand: \'' + config.serversagarmatha01.convertCommand + '\''))
    .pipe(replace(/gsCommand: '(.*)'/g, 'gsCommand: \'' + config.serversagarmatha01.gsCommand + '\''))
    .pipe(replace(/concurrencyImageProcesses: \d+/g, 'concurrencyImageProcesses: ' + config.serversagarmatha01.concurrencyImageProcesses))
    .pipe(replace(/pusher_appId: '(.*)'/g, 'pusher_appId: \'' + config.serversagarmatha01.pusher.appId + '\''))
    .pipe(replace(/pusher_key: '(.*)'/g, 'pusher_key: \'' + config.serversagarmatha01.pusher.apiKey + '\''))
    .pipe(replace(/pusher_secret: '(.*)'/g, 'pusher_secret: \'' + config.serversagarmatha01.pusher.secret + '\''))
    .pipe(replace(/domain: '(.*)'/g, 'domain: \'' + config.serversagarmatha01.domain + '\''))
    .pipe(gulp.dest('build-server-sagarmatha01'));

  return gulp.src([
    'server/**/*',
    '!server/config.js',
    'server.js'
  ], {"base": "."})
    .pipe(gulp.dest('build-server-sagarmatha01'));
});

// Server build production - sagarmatha02
gulp.task('build:serversagarmatha01', function() {
  gulp.src('package.json', {"base": "."})
    .pipe(replace(/"devDependencies":\s[\s\S]*},/g, '"devDependencies":{},'))
    .pipe(gulp.dest('build-server-sagarmatha01'));

  gulp.src('server/config.js', {"base": "."})
    .pipe(replace(/PROXY_URL: '(.*)'/g, 'PROXY_URL: \'' + config.serversagarmatha01.PROXY_URL + '\''))
    .pipe(replace(/path\.join\(rootPath, '(.*)'\)/g, 'path.join(rootPath, \'' + config.serversagarmatha01.assetLocation + '\')'))
    .pipe(replace(/imagePathRoot: '(.*)\/'/g, 'imagePathRoot: \'' + config.serversagarmatha01.assetLocation + '\''))
    .pipe(replace(/maxFileSize: \d+/g, 'maxFileSize: ' + config.serversagarmatha01.maxFileSize))
    .pipe(replace(/convertCommand: '(.*)'/g, 'convertCommand: \'' + config.serversagarmatha01.convertCommand + '\''))
    .pipe(replace(/gsCommand: '(.*)'/g, 'gsCommand: \'' + config.serversagarmatha01.gsCommand + '\''))
    .pipe(replace(/concurrencyImageProcesses: \d+/g, 'concurrencyImageProcesses: ' + config.serversagarmatha01.concurrencyImageProcesses))
    .pipe(replace(/pusher_appId: '(.*)'/g, 'pusher_appId: \'' + config.serversagarmatha01.pusher.appId + '\''))
    .pipe(replace(/pusher_key: '(.*)'/g, 'pusher_key: \'' + config.serversagarmatha01.pusher.apiKey + '\''))
    .pipe(replace(/pusher_secret: '(.*)'/g, 'pusher_secret: \'' + config.serversagarmatha01.pusher.secret + '\''))
    .pipe(replace(/domain: '(.*)'/g, 'domain: \'' + config.serversagarmatha01.domain + '\''))
    .pipe(gulp.dest('build-server-sagarmatha01'));

  return gulp.src([
    'server/**/*',
    '!server/config.js',
    'server.js'
  ], {"base": "."})
    .pipe(gulp.dest('build-server-sagarmatha01'));
});


// NOIS Server build
gulp.task('build:serverNois', function() {
  gulp.src('package.json', {"base": "."})
    .pipe(replace(/"devDependencies":\s[\s\S]*},/g, '"devDependencies":{},'))
    .pipe(gulp.dest('build-server-nois'));

  gulp.src('server/config.js', {"base": "."})
    .pipe(replace(/PROXY_URL: '(.*)'/g, 'PROXY_URL: \'' + config.serverNois.PROXY_URL + '\''))
    .pipe(replace(/path\.join\(rootPath, '(.*)'\)/g, 'path.join(rootPath, \'' + config.serverNois.assetLocation + '\')'))
    .pipe(replace(/imagePathRoot: '(.*)'/g, 'imagePathRoot: \'' + config.serverNois.assetLocation + '\''))
    .pipe(replace(/maxFileSize: \d+/g, 'maxFileSize: ' + config.serverNois.maxFileSize))
    .pipe(replace(/concurrencyImageProcesses: \d+/g, 'concurrencyImageProcesses: ' + config.serverNois.concurrencyImageProcesses))
    .pipe(replace(/convertCommand: '(.*)'/g, 'convertCommand: \'' + config.serverNois.convertCommand + '\''))
    .pipe(replace(/gsCommand: '(.*)'/g, 'gsCommand: \'' + config.serverNois.gsCommand + '\''))
    .pipe(replace(/pusher_appId: '(.*)'/g, 'pusher_appId: \'' + config.serverNois.pusher.appId + '\''))
    .pipe(replace(/pusher_key: '(.*)'/g, 'pusher_key: \'' + config.serverNois.pusher.apiKey + '\''))
    .pipe(replace(/pusher_secret: '(.*)'/g, 'pusher_secret: \'' + config.serverNois.pusher.secret + '\''))
    .pipe(replace(/domain: '(.*)'/g, 'domain: \'' + config.serverNois.domain + '\''))
    .pipe(gulp.dest('build-server-nois'));

  return gulp.src([
    'server/**/*',
    '!server/config.js',
    'server.js'
  ], {"base": "."})
    .pipe(gulp.dest('build-server-nois'));
});

////////////////////////////////////
///////// SERVE TASKS //////////////
///////////////////////////////////

gulp.task('serve', ['watch'], function() {
  connect.server({
    root: ['src'],
    port: 9000,
    livereload: true
  });
  open("http://localhost:9000");
});

gulp.task('serve:local', function() {
  connect.server({
    root: ['build-local'],
    port: config.local.port
  });
  open("http://localhost:9000");
});

////////////////////////////////////
///////// DEPLOY TASKS /////////////
///////////////////////////////////

gulp.task('deploy:ui:local', ['build:local'], function() {
  process.stdout.write('Transfering files...\n');

  var conn = ftp.create({
    host: '192.168.1.224',
    user: 'nois_node',
    password: 'Nois2015',
    parallel: 2
  });

  var globs = [
    'build-local/**/*'
  ];

  return gulp.src(globs, {base: './build-local/', buffer: false})
    //.pipe(conn.newer('/onTargetUI'))
    .pipe(conn.dest('/onTargetUI'));
});

gulp.task('deploy:node:local', ['build:server'], function() {
  process.stdout.write('Transfering files...\n');

  var conn = ftp.create({
    host: '192.168.1.224',
    user: 'nois_node',
    password: 'Nois2015',
    parallel: 2
  });

  var globs = [
    'build-server/**/*'
  ];

  return gulp.src(globs, {base: './build-server/', buffer: false})
    //.pipe(conn.newer('/onTargetNodeServer'))
    .pipe(conn.dest('/onTargetNodeServer'));
});

gulp.task('deploy:local', ['deploy:ui:local', 'deploy:node:local'], function() {

});

gulp.task('deploy', ['build'], function() {
  process.stdout.write('Transfering files...\n');

  var conn = ftp.create({
    host: '192.168.1.224',
    user: 'nois_node',
    password: 'Nois2015',
    parallel: 2
  });

  var globs = [
    'build/**',
    'server/**',
    'server.js',
    'package.json'
  ];

  return gulp.src(globs, {base: '.', buffer: false})
    //.pipe(conn.newer('/onTarget/ontarget/Code'))
    .pipe(conn.dest('/onTarget/ontarget/Code'));
});