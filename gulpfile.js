const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const gulpSequence = require('gulp-sequence');
const util = require('util');

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
  return gulpSequence('lint', 'test', () => {
    done();
  });
});

gulp.task('default', ['check']);

