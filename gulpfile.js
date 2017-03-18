'use strict'

const gulp = require('gulp')
const babel = require('gulp-babel')
const del = require('del')
const concat = require('gulp-concat')
const polyfiller = require('gulp-polyfiller')

gulp.task('buildPolyfills', () =>
  polyfiller
    .bundle(['Fetch'])
    .pipe(gulp.dest('build'))
)

gulp.task('buildApp', () =>
  gulp.src('./public/static/app.js')
    .pipe(babel({
      plugins: [
        'babel-plugin-transform-es2017-object-entries',
        'transform-async-to-generator'
      ]
    }))
    .pipe(gulp.dest('build'))
)

gulp.task('concatFiles', ['buildPolyfills', 'buildApp'], () =>
  gulp.src(['./build/polyfills.js', './build/app.js'])
    .pipe(concat('app.js', { newLine: ';' }))
    .pipe(gulp.dest('build'))
)

gulp.task('cleanPolyfills', ['concatFiles'], callback => {
  del(['./build/polyfills.js'], callback)
})

gulp.task('default', ['cleanPolyfills'], () => { console.log('Build finished')})
