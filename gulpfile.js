var gulp = require('gulp');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');

function compile(watch) {
  var bundler = watchify(browserify('./src/index.js', { debug: true }).transform(babel));

  function rebundle() {
    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(source('build.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./build'));
  }

  if (watch) {
    bundler.on('update', function() {
      console.log('-> bundling...');
      rebundle();
    });
  }

  rebundle();
}

function watch() {
  return compile(true);
};

function production() {
  var bundler = browserify('./src/index.js').transform(babel);

  function rebundle() {
    bundler.bundle()
      .pipe(source('prod.js'))
      .pipe(buffer())
      .pipe(uglify())
      .pipe(gulp.dest('./build'));
  }

  rebundle();
}

gulp.task('build', function() { return compile(); });
gulp.task('prod', function() { return production(); });
gulp.task('watch', function() { return watch(); });

gulp.task('default', ['watch']);
