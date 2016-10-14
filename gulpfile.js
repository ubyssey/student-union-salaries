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

gulp.task('html', ['clean'], function() {
  return gulp.src('./src/html/index.html')
    .pipe(replace(/<link href="style.css"[^>]*>/, function(s) {
      var style = fs.readFileSync('./src/css/style.css', 'utf8');
      return '<style>\n' + style + '\n</style>';
    }))
    .pipe(minifier())
    .pipe(gulp.dest('./dist/'));
});

gulp.task('js', ['clean'], function() {
  return gulp.src('./src/js/index.js')
    .pipe(minifier())
    .pipe(gulp.dest('./dist/'));
});

gulp.task('images', ['clean'], function() {
  return gulp.src('./src/images/**/*')
    .pipe(gulp.dest('./dist/images/'));
});

gulp.task('default', ['html', 'js', 'images']);
