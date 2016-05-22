const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const gulpSequence = require('gulp-sequence');
const util = require('util');
const mochaPhantomJS = require('gulp-mocha-phantomjs');
const istanbulReport = require('gulp-istanbul-report');
const coverageFile = './coverage/coverage.json';


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

const mochaPhantomOpts = {
  phantomjs: {
    hooks: 'mocha-phantomjs-istanbul',
    coverageFile: coverageFile,
  },
};

gulp.task('cover', () => {
  gulp.src('test-runner.html', { read: false })
  .pipe(mochaPhantomJS(mochaPhantomOpts))
  .on('finish', () => {
    gulp.src(coverageFile)
    .pipe(istanbulReport());
  });
});

gulp.task('default', ['check']);

