var gulp = require('gulp');
var path = require('path');
var concat = require('gulp-concat');
var less = require('gulp-less');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var connect = require('gulp-connect');
var open = require('open');
var jshint = require('gulp-jshint');
var karma = require('gulp-karma');
var uglify = require('gulp-uglify');
var replace = require('gulp-replace');
var shell = require('gulp-shell');
var del = require('del');
var ftp = require('vinyl-ftp');

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

// Connect build version
gulp.task('runbuild', function() {
  connect.server({
    root: ['build'],
    port: 9000,
    livereload: true
  });
  open("http://localhost:9000");
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

// build task
gulp.task('build', ['requireJsOptimizer'], function() {
  // Move css file
  gulp.src('src/css/main.min.css')
    .pipe(gulp.dest('build/css'));

  // Minify js
  gulp.src('src/javascripts/main.min.js')
    //.pipe(uglify())
    .pipe(gulp.dest('build/javascripts'));

  del([
    'build/javascripts/main.js',
    'build/javascripts/build.js',
    'src/javascripts/main.min.js',
    'src/javascripts/main.min.js.map'
  ]);
});

// start task
gulp.task('start', ['watch'], function() {
  connect.server({
    root: ['src'],
    port: 9000,
    livereload: true
  });
  open("http://localhost:9000");
});

// deploy
gulp.task('deploy:build', ['build'], function() {
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
    .pipe(conn.newer('/www/onTarget/ontarget/Code'))
    .pipe(conn.dest('/www/onTarget/ontarget/Code'));

  process.stdout.write('Transfer complete...\n');
});