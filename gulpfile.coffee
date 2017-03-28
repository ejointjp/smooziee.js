$ = require('gulp-load-plugins')()

browser = require 'browser-sync'
gulp = require 'gulp'
sequence = require 'run-sequence'
del = require 'del'
reload = browser.reload


# Config ######################

dir =
  src: './src'
  test: './test'
  dist: './dist'
  docs: './docs'

path =
  src: dir.src
  sass: dir.src + '/_sass'
  cssSrc: dir.css + '/tocjs'
  coffee: dir.src + '/_coffee'
  coffeeAll: dir.src + '/_coffee/all'
  jsSrc: dir.src + '/_js'
  jsAllSrc: dir.src + '/_js/all'
  assets: dir.docs + '/assets'

  css: dir.test
  js: dir.test

uri = '' # http://example.localhost


sassOptions =
  style: 'expanded'
  require: ['bourbon']
  sourcemap: false


pleeeseOptions =
  autoprefixer:
    browsers: ['last 2 versions']
  minifier: false
  sourcemaps: false
  sass: false
  mqpacker: true


# Tasks #######################

#Sass
gulp.task 'sass', ->
  $.rubySass path.sass + '/**/*.scss', sassOptions
    .pipe $.cached 'sass'
    .pipe $.pleeease pleeeseOptions
    .pipe gulp.dest path.css
    .pipe gulp.dest dir.dist
    .pipe $.pleeease {minifier: true}
    .pipe $.rename {suffix: '.min'}
    .pipe gulp.dest path.css
    .pipe gulp.dest dir.dist

    .pipe reload {stream: true}

#Js
gulp.task 'js', ->
  gulp.src path.jsSrc + '/*.js'
    .pipe $.plumber()
    .pipe gulp.dest path.js
    .pipe gulp.dest dir.dist
    .pipe $.uglify()
    .pipe $.rename {suffix: '.min'}
    .pipe gulp.dest path.js
    .pipe gulp.dest dir.dist
    # .pipe gulp.dest path.assets + '/js'
    .pipe reload {stream: true}


#Clean
gulp.task 'clean', ->
  del [dir.dist + '/**/*', dir.test + '/**/*{css,js}']

#Build
gulp.task 'build', (cb) ->
  sequence(
    ['clean']
    ['sass', 'js']
    cb
  )


#BrowserSync
gulp.task 'browserSync', ->
  browser
    server:
      baseDir: dir.test
    browser: 'google chrome'

gulp.task 'browserSyncPHP', ->
  browser
    proxy: uri
    browser: 'google chrome'

#Reload
gulp.task 'reload', ->
  reload
    stream: true


#Watch
sync = if uri then 'PHP' else ''

gulp.task 'default', ['browserSync' + sync], ->
  gulp.watch path.sass + '/**/*.scss', ['sass']
  gulp.watch path.coffee + '/*.coffee', ['coffee']
  gulp.watch path.coffeeAll + '/*.coffee', ['coffeeall']
  gulp.watch path.jsSrc + '/*.js', ['js']
  gulp.watch path.jsAllSrc +  '/*.js', ['jsall']
  gulp.watch path.imgSrc + '/*{svg,png,jpg,gif}', ['imgmin']
  gulp.watch path.test + '/**/*{php,html}'
    .on 'change', reload
