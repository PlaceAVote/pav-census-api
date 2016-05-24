const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const gulpSequence = require('gulp-sequence');
const util = require('util');
const istanbul = require('gulp-istanbul');

gulp.task('lint', () =>
  gulp.src(['*.js', 'lib/**/*.js', 'test/**/*.js', 'test/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
);

gulp.task('test', () => {
  return gulp.src(['test/**/*.js', 'test/*.js'], { read: false })
    .pipe(mocha({ reporter: 'spec' }))
    .on('error', util.log);
});

gulp.task('check', (done) => {
  return gulpSequence('lint', 'test', 'cover', () => {
    done();
  });
});

gulp.task('pre-testCoverage', () => {
  return gulp.src('lib/**/*.js')
          .pipe(istanbul({
            includeUntested: true,
          }))
          .pipe(istanbul.hookRequire());
});

gulp.task('cover', ['pre-testCoverage'], () => {
  return gulp.src('test/**/*.js')
         .pipe(mocha())
         .pipe(istanbul.writeReports());
});

gulp.task('default', ['check']);

