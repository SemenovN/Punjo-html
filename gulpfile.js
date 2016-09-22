'use strict';
var gulp        = require('gulp');
var jade        = require('gulp-jade');
var sass        = require('gulp-sass');
var watch       = require('gulp-watch');
var browserSync = require('browser-sync').create();
var del         = require('del');
var svgSprite   = require('gulp-svg-sprite');
var svgmin      = require('gulp-svgmin');
var cheerio     = require('gulp-cheerio');
var replace     = require('gulp-replace');
var imagemin    = require('gulp-imagemin');
var concat      = require('gulp-concat');

gulp.task('jade', function () {
  return gulp.src(['./source/template/**/*.jade', '!./source/template/includes/*'])
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('./dist/'))
});

gulp.task('sass', function () {
  return gulp.src('./source/styles/main.scss')
    .pipe(sass()).on('error', function (error) {
      console.log(error);
      this.end();
    })
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('concat-libs', function () {
  return gulp.src('./source/libs/*.js')
    .pipe(concat('main.js'))
    .pipe(gulp.dest('./dist/js'));
});

gulp.task('imagemin', function () {
  return gulp.src('./source/images/*')
    .pipe(imagemin())
    .pipe(gulp.dest('./dist/images'))
});

gulp.task('motion-fonts', function () {
  return gulp.src('./source/fonts/*')
    .pipe(gulp.dest('./dist/fonts'))
});

gulp.task('watch', function () {
  gulp.watch('./source/template/**/*.jade', gulp.series('jade'));
  gulp.watch('./source/styles/**/*.scss', gulp.series('sass'));
});

gulp.task('serve', function () {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  });
 gulp.watch('./dist').on('change', browserSync.reload);
});

gulp.task('svgSpriteBuild', function () {
  return  gulp.src('source/images/icons/*.svg')
  // minify svg
    .pipe(svgmin({
      js2svg: {
        pretty: true
      }
    }))
    // remove all fill, style and stroke declarations in out shapes
    .pipe(cheerio({
      run: function ($) {
        $('[fill]').removeAttr('fill');
        $('[stroke]').removeAttr('stroke');
        $('[style]').removeAttr('style');
      },
      parserOptions: {xmlMode: true}
    }))
    // cheerio plugin create unnecessary string '&gt;', so replace it.
    .pipe(replace('&gt;', '>'))
    // build svg sprite
    .pipe(svgSprite({
      mode: {
        symbol: {
          sprite: "../sprite.svg",
          render: {
            scss: {
              dest:'../../styles/partials/_sprite.scss',
              template: "../punjo-html/source/styles/modules/_sprite_template.scss"
            }
          }
        }
      }
    }))
    .pipe(gulp.dest('source/images'));
});

gulp.task('clean', function () {
  return del('./dist');
});

gulp.task('default', gulp.series(
  'clean',
  gulp.parallel(
    'jade',
    'sass',
    'concat-libs',
    'imagemin',
    'motion-fonts'
  ),
  gulp.parallel(
    'watch',
    'serve'
  )
));