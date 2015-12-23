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
var argv = require('yargs').argv;

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
  del([
    'build/javascripts/main.js',
    'build/javascripts/build.js'
  ]);
});

// UI Build Task
gulp.task('build:ui', ['build'], function() {
  var environment = argv.env;
  var envConfig = config.envs[environment];
  // Copy all file in build folder
  gulp.src(['./build/**/*', '!./build/javascripts/main.min.js'])
    .pipe(gulp.dest('./build-' + environment + '/app'));

  // modify and minify
  gulp.src(['./src/javascripts/main.min.js'])
    .pipe(replace(/domain: '.*'/, "domain: '" + envConfig.domain + "'")) // domain
    .pipe(replace(/baseUrl: '.*'/, "baseUrl: '" + envConfig.baseUrl + "'")) // base url
    .pipe(replace(/nodeServer: '.*'/, "nodeServer: '" + envConfig.nodeServer + "'")) // node server domain
    .pipe(replace(/resourceUrl: '.*'/, "resourceUrl: '" + envConfig.resourceUrl + "'"))
    .pipe(replace(/newBimServer: '.*'/, "newBimServer: '" + envConfig.newBimServer + "'"))
    .pipe(replace(/pusher_api_key: '.*'/, "pusher_api_key: '" + envConfig.pusher.apiKey + "'"))
    .pipe(replace(/weatherUrl: '.*'/, "weatherUrl: '" + envConfig.weatherUrl + "'"))
    .pipe(uglify())
    .pipe(gulp.dest('./build-' + environment + '/app/javascripts'));

  // Copy app.js and modify value
  gulp.src('./app.js')
    .pipe(replace(/API_SERVER\s=\s'.*'/, "API_SERVER = '" + envConfig.API_SERVER + "'"))
    .pipe(replace(/pusher_appId\s=\s'(.*)'/g, 'pusher_appId = \'' + envConfig.pusher.appId + '\''))
    .pipe(replace(/pusher_key\s=\s'(.*)'/g, 'pusher_key = \'' + envConfig.pusher.apiKey + '\''))
    .pipe(replace(/pusher_secret\s=\s'(.*)'/g, 'pusher_secret = \'' + envConfig.pusher.secret + '\''))
    .pipe(replace(/awsProfile\s=\s'(.*)'/g, 'awsProfile = \'' + envConfig.aws_s3_profile + '\''))
    .pipe(gulp.dest('./build-' + environment));

  gulp.src('./package.app.json')
    .pipe(rename('./package.json'))
    .pipe(gulp.dest('./build-' + environment));
});

// Server Build Task
gulp.task('build:server', function() {
  var environment = argv.env;
  var envConfig = config.envs[environment];
  gulp.src('package.json', {"base": "."})
    .pipe(replace(/"devDependencies":\s[\s\S]*},/g, '"devDependencies":{},'))
    .pipe(gulp.dest('build-server-' + environment));

  gulp.src('server/config.js', {"base": "."})
    .pipe(replace(/PROXY_URL: '(.*)'/g, 'PROXY_URL: \'' + envConfig.API_SERVER + '\''))
    .pipe(replace(/path\.join\(rootPath, '(.*)'\)/g, 'path.join(rootPath, \'' + envConfig.assetLocation + '\')'))
    .pipe(replace(/imagePathRoot: '(.*)'/g, 'imagePathRoot: \'' + envConfig.assetLocation + '\''))
    .pipe(replace(/maxFileSize: \d+/g, 'maxFileSize: ' + envConfig.maxFileSize))
    .pipe(replace(/concurrencyImageProcesses: \d+/g, 'concurrencyImageProcesses: ' + envConfig.concurrencyImageProcesses))
    .pipe(replace(/convertCommand: '(.*)'/g, 'convertCommand: \'' + envConfig.convertCommand + '\''))
    .pipe(replace(/gsCommand: '(.*)'/g, 'gsCommand: \'' + envConfig.gsCommand + '\''))
    .pipe(replace(/pusher_appId: '(.*)'/g, 'pusher_appId: \'' + envConfig.pusher.appId + '\''))
    .pipe(replace(/pusher_key: '(.*)'/g, 'pusher_key: \'' + envConfig.pusher.apiKey + '\''))
    .pipe(replace(/pusher_secret: '(.*)'/g, 'pusher_secret: \'' + envConfig.pusher.secret + '\''))
    .pipe(replace(/domain: '(.*)'/g, 'domain: \'' + envConfig.nodeServer + '\''))
    .pipe(replace(/resource_domain: '(.*)'/g, 'resource_domain: \'' + envConfig.resourceUrl + '\''))
    .pipe(replace(/aws_s3_bucket: '(.*)'/g, 'aws_s3_bucket: \'' + envConfig.aws_s3_bucket + '\''))
    .pipe(replace(/aws_s3_profile: '(.*)'/g, 'aws_s3_profile: \'' + envConfig.aws_s3_profile + '\''))
    .pipe(gulp.dest('build-server-' + environment));

  return gulp.src([
    'server/**/*',
    '!server/config.js',
    'server.js'
  ], {"base": "."})
    .pipe(gulp.dest('build-server-' + environment));
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