import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import {stream as wiredep} from 'wiredep';

const $ = gulpLoadPlugins();

gulp.task('styles', () => {
  return gulp.src('src/styles/gistify-admin.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.sourcemaps.write())
    .pipe($.minifyCss({compatibility: '*'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('js', () => {
  return gulp.src(['src/js/gistify-button.js', 'src/js/gistify-render.js'])
    .pipe($.uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['dist']));

gulp.task('build', ['styles', 'js'], () => {
  var ret = gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
  return ret;
});

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});

gulp.task('dist', ['default'], () => {
  del 'src';
});