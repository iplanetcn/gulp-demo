const { src, dest, parallel, watch, series } = require('gulp');
const uglify = require('gulp-uglify');
const clean = require('gulp-clean');
const connect = require('gulp-connect');
const sass = require('gulp-sass');
const minifyCss = require('gulp-minify-css');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const webpack = require('webpack-stream');

const serverConfig = {
    root: 'dist',       // 根目录
    port: 8000,         // 端口
    livereload: true    // 自动刷新
}

function server() {
    connect.server(serverConfig);
}

/**
 * gulp.src()   找到源文件路径
 * gulp.dest()  找到目标的文件路径 【注】如果设置的这个目的文件路径不存在，会自动创建
 * pip()        连接程序运行的管道
 */

function del() {
    return src('dist/*').pipe(clean());
}

function html() {
    return src("src/*.html")
        .pipe(dest('dist'))
        .pipe(connect.reload());
}

function image() {
    return src('src/img/**/*')
        .pipe(dest('dist/images'))
        .pipe(connect.reload());
}

function css() {
    return src('src/sass/*.scss')
        .pipe(sass())
        .pipe(dest('dist/css'))
        .pipe(minifyCss())
        .pipe(rename({suffix:'.min'}))
        .pipe(dest('dist/css'))
        .pipe(connect.reload());
}

function data() {
    return src(['src/json/*.json', 'xml/*.xml'])
        .pipe(dest('dist/data'))
        .pipe(connect.reload());
}

function javascript() {
    return src('src/javascript/*.js')
    .pipe(concat('index.js'))
    .pipe(webpack())
    .pipe(rename('index.js'))
    .pipe(dest("dist/js"))
    .pipe(connect.reload());
}

function watcher() {
    /**
     * 第一个参数，文件夹的监听路径
     * 第二个参数，执行的任务
     */
    watch('src/*.html', series(html));
    watch('src/img/**/*', series(image));
    watch('src/sass/*.scss', series(css));
    watch('src/javascript/*.js', series(javascript));
    watch(['src/json/*.json', 'xml/*.xml'], series(data));
}


exports.clean = del;
exports.default = series(del, parallel(image), html, javascript, css, data, parallel(server, watcher));