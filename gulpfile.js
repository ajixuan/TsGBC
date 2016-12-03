var gulp = require('gulp');
var del = require('del');
var runSequence = require('run-sequence');
var tar = require('gulp-tar');
var p = require('./package.json')
var ts = require('gulp-typescript');

var dir = {
  src: 		'./src/main/**/*',
  html: 	'./src/html/**/*',
  target:	'./target/**/*'
};

gulp.task('clean', function() {
  return del(['target']);
});

gulp.task('src', function() {
	return gulp.src(dir.src)
		.pipe(ts({
            noImplicitAny: true,
            out: 'app.js'
        }))
        .pipe(gulp.dest('target/'));
});

gulp.task('html', function() {
	return gulp.src(dir.html)
		.pipe(gulp.dest('target/'));
});


gulp.task('package', function() {
	var name = "RTCJS-" + p.version + ".tar";
	return gulp.src(['!target/' + name, dir.target])
		.pipe(tar(name))
		.pipe(gulp.dest('target/'));
});

gulp.task('build', ['html', 'src']);

gulp.task('watch', function() {
  gulp.watch([dir.src, dir.html], ['build']);
});

gulp.task('default', function(callback) {
	runSequence('clean',
				'build',
				'package',
				 callback);
});