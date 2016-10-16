var gulp = require('gulp');
var replace = require('gulp-replace');
var minify = require('gulp-minifier');
var clean = require('gulp-clean');

var fs = require('fs');

var minifier = function() {
  return minify({
    minify: true,
    collapseWhitespace: true,
    minifyJS: true,
    minifyCSS: true,
  });
};

gulp.task('clean', function() {
  return gulp.src('./dist/', {read: false})
    .pipe(clean());
});

gulp.task('css', ['clean'], function() {
  return gulp.src('./src/css/style.css')
    .pipe(minifier())
    .pipe(gulp.dest('./dist/css/'));
});

gulp.task('js', ['clean', 'css'], function() {
  return gulp.src('./src/js/index.js')
    .pipe(replace('GULP_REPLACE_STYLES', function(s) {
      return fs.readFileSync('./dist/css/style.css', 'utf8');
    }))
    .pipe(minifier())
    .pipe(gulp.dest('./dist/'));
});

gulp.task('images', ['clean'], function() {
  return gulp.src('./src/images/**/*')
    .pipe(gulp.dest('./dist/images/'));
});

gulp.task('build', ['css', 'js', 'images']);

gulp.task('default', ['build'], function() {
  gulp.watch(['./src/**/*'], ['build']);
});
