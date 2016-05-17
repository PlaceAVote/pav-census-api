const gulp = require('gulp');
const eslint = require('gulp-eslint');

gulp.task('lint', () =>
  gulp.src(['*.js', 'lib/**/*.js', 'test/**/*.js', 'test/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
);

gulp.task('default', ['lint']);

