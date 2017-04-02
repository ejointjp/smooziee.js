// Require

var gulp = require('gulp');

var gulpLoadPluginsOptions = {
  pattern: ['gulp-*', 'gulp.*'],
  replaceString: /\bgulp[\-.]/
};

var $ = require('gulp-load-plugins')(gulpLoadPluginsOptions);

var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');


// Config

var dir = {
  sass: 'src/_scss/',
  js: 'src/_js/',
  test: 'test/',
  dist: 'dist/'
};

var name = {
  js: {
    bundle: 'bundle.js',
    demo: 'demo.js'
  }
};

var src = {
  sass: dir.sass + '**/*.scss',
  js: dir.js + '**/*.js',
  jsDist: [
    dir.js + '**/*.js',
    '!' + dir.js + '**/' + name.js.demo
  ],
  html: dir.dist + '**/*.html'
};

var pleeeaseOptions = {
  autoprefixer: {
    browsers: ['last 2 versions']
  },
  minifier: false,
  sourcemaps: false,
  sass: false,
  mqpacker: true
};

var browserifyOptions = {
  entries: dir.js + name.js.demo
};


// Tasks

gulp.task('sass', function(){
  return gulp.src(src.sass)
    .pipe($.sass({outputStyle: 'expanded'}).on('error', $.sass.logError))
    .pipe($.pleeease(pleeeaseOptions))
    .pipe(gulp.dest(dir.test))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('js', function(){
  browserify(browserifyOptions)
    .bundle()
    .pipe(source(name.js.bundle))
    .pipe(buffer())
    .pipe($.uglify())
    // .pipe($.rename({suffix: '.min'}))
    .pipe(gulp.dest(dir.test))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('js-build', function(){
  return gulp.src(src.jsDist)
    .pipe(gulp.dest(dir.dist))
    .pipe($.uglify())
    .pipe($.rename({suffix: '.min'}))
    .pipe(gulp.dest(dir.dist));
});

gulp.task('clean', function(){
  del([dir.test + '**/*{css,js}', dir.dist + '**/*']);
});

gulp.task('build', function(){
  runSequence(
    'clean',
    ['sass', 'js'],
    ['js-build']
  );
});

gulp.task('browserSync', function(){
  browserSync({
    server: {
      baseDir: dir.test
    },
    browser: 'google chrome',
    reloadDelay: 1500
  });
});

// Watch

gulp.task('default', ['browserSync', 'sass', 'js'], function(){

  $.watch(src.sass, function(){
    return gulp.start(['sass']);
  });

  $.watch(src.js, function(){
    return gulp.start(['js']);
  });

  $.watch(src.html).on('change', browserSync.reload);
});
