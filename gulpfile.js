'use strict'

const gulp = require('gulp')
const babel = require('gulp-babel')

gulp.task('build', () =>
  gulp.src('./public/static/app.js')
    .pipe(babel({ plugins: ['transform-async-to-generator'], presets: ['babili'] }))
    .pipe(gulp.dest('./build/static'))
)

gulp.task('moveApi', () =>
  gulp.src('./public/api/*')
    .pipe(gulp.dest('./build/api'))
)

gulp.task('moveIndex', () =>
  gulp.src('./public/index.html')
    .pipe(gulp.dest('./build'))
)

gulp.task('default', ['build', 'moveApi', 'moveIndex'], () => { console.log('Build finished')})
