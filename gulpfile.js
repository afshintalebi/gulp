// Base Gulp File
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    notify = require('gulp-notify'),
    browserSync = require('browser-sync'),
    del = require('del'),
    uglify = require('gulp-uglify'),
    gulpif = require('gulp-if'),
    rename = require('gulp-rename'),
    preprocess = require('gulp-preprocess'),
    cleanCSS = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    runSequence = require('run-sequence'),
    argv = require('yargs').argv;

var cssOutputStyle='expanded',
    env = argv.production ? 'production' : 'development',
    outputDir = './dist',
    sourceDir = './src';

var jsSources=[
    sourceDir + '/js/jquery.js',
    sourceDir + '/js/bootstrap.min.js',
    sourceDir + '/js/animatescroll.js',
    sourceDir + '/js/scripts.js',
    sourceDir + '/js/retina.min.js',
];
if(env == 'production') {
  cssOutputStyle='compressed';
}

// Compile SCSS
gulp.task('sass', function () {
  return gulp.src(sourceDir+'/scss/style.scss')
    .pipe(sass({
      // errLogToConsole: false,
      // outputStyle: cssOutputStyle,
      // paths: [ path.join(__dirname, 'scss', 'includes') ]
    })
    .on("error", notify.onError(function(error) {
      return "Failed to Compile SCSS: " + error.message;
    })))
    .pipe(gulp.dest(sourceDir+'/css'));
});


// Copy & minify css files
gulp.task('css', function() {
    return gulp.src(sourceDir+'/css/**/*.css')
        .pipe(gulpif(env == 'production', cleanCSS()))
        .pipe(gulp.dest(outputDir+'/css'));
});



// Copy & minify JS files
gulp.task('js', function() {
    return gulp.src(jsSources)
        // .pipe(concat('scripts.js'))
        .pipe(gulpif(env == 'production', uglify()))
        .pipe(gulp.dest(outputDir+'/js'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

// Html preprocess
gulp.task('html', function() {
    gulp.src(sourceDir+'/index.html')
        .pipe(preprocess({context: { env: 'production', DEBUG: true}})) //To set environment variables in-line
        .pipe(gulp.dest(outputDir))
        .pipe(browserSync.reload({
            stream: true
        }));
});

// Gulp Clean Up Task
gulp.task('clean', function() {
    del(outputDir+'/**');
});

// Copy required files
gulp.task('copyRequiredFiles', function() {
    return gulp.src([sourceDir+'/img/**/*', sourceDir+'/landy-icons/**/*'],{base:sourceDir})
        .pipe(gulp.dest(outputDir));
})


// BrowserSync Task (Live reload)
gulp.task('browserSync', function() {
    browserSync({
        server: {
            baseDir: outputDir
        }
    })
});

// Gulp Watch Task
gulp.task('watch', ['browserSync'], function () {
    gulp.watch(sourceDir+'/scss/**/*.scss', ['sass']);
    gulp.watch(sourceDir+'/css/**/*.css', function () {
        runSequence('css',function () {
            browserSync.reload();
        });
    });
    gulp.watch(sourceDir+'/js/**/*.js', ['js']);
    gulp.watch(sourceDir+'/index.html',['html']);
});

// Gulp Default Task
gulp.task('default', ['watch']);

// Gulp Build Task
gulp.task('build',[],function () {
    runSequence('clean', 'sass','css','js','html','copyRequiredFiles');
});