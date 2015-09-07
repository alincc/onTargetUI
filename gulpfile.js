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

var config = {
  default: {
    port: 3214,
    domain: 'http://demo.newoceaninfosys.com:3214/ontargetrs/services',
    baseUrl: 'http://demo.newoceaninfosys.com:3214',
    nodeServer: 'http://demo.newoceaninfosys.com:3214'
  },
  local: {
    port: 3214,
    domain: 'http://demo.newoceaninfosys.com:3214/ontargetrs/services',
    baseUrl: 'http://demo.newoceaninfosys.com:3214',
    nodeServer: 'http://demo.newoceaninfosys.com:3214'
  }
};

var paths = {
  less: ['./src/less/**/*.less']
};

// Combine lesses
gulp.task('less', ['lint'], function(done) {
  gulp.src('./src/less/main.less')
    .pipe(less())
    .pipe(gulp.dest('./src/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({extname: '.min.css'}))
    .pipe(gulp.dest('./src/css/'))
    .on('end', done);
});

gulp.task('lessOnly', function(done) {
  gulp.src('./src/less/main.less')
    .pipe(less())
    .pipe(gulp.dest('./src/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({extname: '.min.css'}))
    .pipe(gulp.dest('./src/css/'))
    .on('end', done);
});

// Copy Fonts
gulp.task('fonts', ['less'], function() {
  gulp.src([
    './src/fonts/*',
    './src/fonts/*/*'])
    .pipe(gulp.dest('./build/fonts/'));

  // font-awesome fonts
  gulp.src([
    './src/bower_components/components-font-awesome/fonts/*'
  ]).pipe(gulp.dest('./build/fonts/'));

  // glyphicon font
  gulp.src([
    './src/bower_components/bootstrap-css-only/fonts/*'
  ]).pipe(gulp.dest('./build/fonts/'));
});

// Copy Images
gulp.task('images', ['fonts'], function() {
  return gulp.src([
    './src/img/**/*'])
    .pipe(gulp.dest('./build/img/'));
});

// Copy js to build
gulp.task('script', ['images'], function() {
  gulp.src([
    './src/bower_components/requirejs/*',
    './src/bower_components/requirejs/**/*.*'])
    .pipe(gulp.dest('./build/bower_components/requirejs'));

  gulp.src([
    './src/javascripts/app/common/resources/**/*.json'])
    .pipe(gulp.dest('./build/javascripts/app/common/resources'));

});

// Copy index.html, rename main and css file
gulp.task('html', ['script'], function() {
  return gulp.src([
    './src/index.html'])
    .pipe(replace('javascripts/main', 'javascripts/main.min'))
    .pipe(replace('css/main.css', 'css/main.min.css'))
    .pipe(gulp.dest('./build/'));
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
gulp.task('requireJsOptimizer', ['html'], shell.task([
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

gulp.task('build', ['requireJsOptimizer'], function() {
  // Move css file
  gulp.src('src/css/main.min.css')
    .pipe(gulp.dest('build/css'));

  // move main script file
  gulp.src('src/javascripts/main.min.js')
    .pipe(replace("domain: 'http://localhost:9000/ontargetrs/services'", "domain: '" + config.default.domain + "'")) // domain
    .pipe(replace("baseUrl: 'http://localhost:9000'", "baseUrl: '" + config.default.baseUrl + "'")) // base url
    .pipe(replace("nodeServer: 'http://localhost:9000'", "nodeServer: '" + config.default.nodeServer + "'")) // node server domain
    .pipe(gulp.dest('build/javascripts'));

  del([
    'build/javascripts/main.js',
    'build/javascripts/build.js',
    'src/javascripts/main.min.js',
    'src/javascripts/main.min.js.map'
  ]);
});

gulp.task('build:local', ['build'], function() {
  gulp.src('src/javascripts/main.min.js')
    .pipe(replace("domain: '" + config.default.domain + "'", "domain: '" + config.local.domain + "'")) // domain
    .pipe(replace("baseUrl: '" + config.default.baseUrl + "'", "baseUrl: '" + config.local.baseUrl + "'")) // base url
    .pipe(replace("nodeServer: '" + config.default.nodeServer + "'", "nodeServer: '" + config.local.nodeServer + "'")) // node server domain
    .pipe(gulp.dest('build/javascripts'));

  gulp.src(['./build/**/*'])
    //.pipe(uglify())
    .pipe(gulp.dest('./build-local/app'));

  // Copy app.js and modify value
  gulp.src('./app.js')
    .pipe(replace("9000", config.local.port))
    .pipe(gulp.dest('./build-local'));

  gulp.src('./package.app.json')
    .pipe(rename('./package.json'))
    .pipe(gulp.dest('./build-local'));
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
    host: '',
    user: '',
    password: '',
    parallel: 2
  });

  var globs = [
    'build-local/**'
  ];

  return gulp.src(globs, {base: './build-local/', buffer: false})
    .pipe(conn.newer('/onTargetUI'))
    .pipe(conn.dest('/onTargetUI'));
});

gulp.task('deploy:node:local', function() {
  process.stdout.write('Transfering files...\n');

  var conn = ftp.create({
    host: '',
    user: '',
    password: '',
    parallel: 2
  });

  var globs = [
    'server/**',
    'server.js',
    'package.json'
  ];

  return gulp.src(globs, {base: '.', buffer: false})
    .pipe(conn.newer('/onTargetNodeServer'))
    .pipe(conn.dest('/onTargetNodeServer'));
});

gulp.task('deploy:local', ['deploy:ui:local', 'deploy:local'], function() {

});

gulp.task('deploy', ['build'], function() {
  process.stdout.write('Transfering files...\n');

  var conn = ftp.create({
    host: '',
    user: '',
    password: '',
    parallel: 2
  });

  var globs = [
    'build/**',
    'server/**',
    'server.js',
    'package.json'
  ];

  return gulp.src(globs, {base: '.', buffer: false})
    .pipe(conn.newer('/onTarget/ontarget/Code'))
    .pipe(conn.dest('/onTarget/ontarget/Code'));
});