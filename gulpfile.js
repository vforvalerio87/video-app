'use strict'

const gulp = require('gulp')
const babel = require('gulp-babel')

gulp.task('build', () =>
  gulp.src('./public/static/app.js')
    .pipe(babel({ plugins: ['transform-async-to-generator'] }))
    .pipe(gulp.dest('build'))
)

gulp.task('default', ['build'], () => { console.log('Build finished')})
