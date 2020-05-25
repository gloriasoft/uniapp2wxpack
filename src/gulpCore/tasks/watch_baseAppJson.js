const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const {cwd, target, env, base} = require('../preset')
const {writeLastLine} = require('../utils')
const mergeToTargetJson = require('../mergeToTargetJson')
gulp.task('watch:baseAppJson', function () {
    return gulp.src(base + '/app.json', {allowEmpty: true, cwd})
        .pipe($.if(env === 'dev', $.watch(base + '/app.json', {cwd}, function (event) {
            // console.log('处理'+event.path)
            writeLastLine('处理' + event.relative + '......')
        })))
        .pipe(mergeToTargetJson('baseAppJson'))
        .pipe(gulp.dest(target, {cwd}))
})
