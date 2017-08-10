var gulp = require('gulp');
var ts = require('gulp-typescript');
var del = require('del');
var runSequence = require('run-sequence');
var tar = require('gulp-tar');
var p = require('./package.json');
var mocha = require('gulp-mocha');
var Builder = require('systemjs-builder');

var dir = {
    modules: './node_modules/',
    assets: './src/html/assets/',
    src: './src/main/**/*.ts',
    test: './src/test/**/*.ts',
    html: './src/html/**/*',
    target: './target/**/*'
};

gulp.task('clean', function () {
    return del(['target']);
});

gulp.task('test', function () {
    return gulp.src(dir.test)
        .pipe(ts({
            outFile: 'test.js',
            removeComments: false,
            preserveConstEnums: true,
            sourceMap: true,
            experimentalDecorators: true,
            declaration: true,
            module: 'system'
        }))
        .pipe(gulp.dest('target'))
        .pipe(mocha());
});

gulp.task('import', function(){
   gulp.src([dir.modules + 'jquery/dist/jquery.js', dir.modules + 'jquery/dist/jquery.min.js'])
       .pipe(gulp.dest(dir.assets));
});

gulp.task('src', function () {
    gulp.src(dir.src)
        .pipe(ts({
            module: 'system',
            experimentalDecorators: true,
            emitDecoratorMetadata: true,
            outFile: 'app.js',
            target: "es6"
        }))
        .pipe(gulp.dest('target'));
});

gulp.task('html', function () {
    gulp.src(dir.html)
        .pipe(gulp.dest('target/'));
});

gulp.task('package', function () {
    var name = "RTCJS-" + p.version + ".tar";
    return gulp.src(['!target/' + name, dir.target])
        .pipe(tar(name))
        .pipe(gulp.dest('target/'));
});

gulp.task('build', function (callback) {
    runSequence('clean', 'import', 'src', 'html', callback);
});

gulp.task('watch', function () {
    gulp.watch([dir.src, dir.html], ['build']);
});

gulp.task('default', function (callback) {
    runSequence('clean',
        'build',
        'package',
        callback);
});