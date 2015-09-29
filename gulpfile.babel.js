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
    .pipe(gulp.dest('.'));
});

gulp.task('js', () => {
  return gulp.src(['src/js/gistify-button.js', 'src/js/gistify-render.js'])
    .pipe($.uglify())
    .pipe(gulp.dest('.'));
});

gulp.task('clean', del.bind(null, ['gistify-button.js', 'gistify-render.js', 'gistify-admin.css', 'gistify.php']));

gulp.task('build', ['styles', 'js'], () => {
  gulp.src('src/gistify.php')
    .pipe(gulp.dest('.'));

  var ret = gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
  return ret;
});

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});

// Prepares a zippeble folder ready-to deploy to Wordpress
// by pruning all unnecessary files
// This task should only be used in a new branch intended for a 
// release because it deletes node_modules as well. In development
// that maybe frustrating
gulp.task('dist', ['default'], () => {
  del(['src', 'node_modules', 'gulpfile.babel.js', 'package.json']);
});