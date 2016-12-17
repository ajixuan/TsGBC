var gulp = require('gulp');
var ts = require('gulp-typescript');
var del = require('del');
var runSequence = require('run-sequence');
var tar = require('gulp-tar');
var p = require('./package.json')
var Builder = require('systemjs-builder');

var dir = {
  src: 		'./src/main/**/*.ts',
  html: 	'./src/html/**/*',
  target:	'./target/**/*'
};

gulp.task('clean', function() {
  return del(['target']);
});

gulp.task('src', function() {
	return gulp.src(dir.src)
		.pipe(ts({
            typescript: require('typescript'), // In my package.json I have "typescript": "~1.8.0-dev.20151128"
            module: 'system',
            experimentalDecorators: true,
            emitDecoratorMetadata: true,
            outFile : 'app.js',
            target: "es5",
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

gulp.task('build', function(callback) {
    runSequence('clean', 'src', 'html', callback);
});

gulp.task('watch', function() {
  gulp.watch([dir.src, dir.html], ['build']);
});

gulp.task('default', function(callback) {
	runSequence('clean',
				'build',
				'package',
				 callback);
});