const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const {cwd, target, env} = require('../preset')
const {writeLastLine} = require('../utils')
gulp.task('watch:projectConfigJson', function () {
    return gulp.src('project.config.json', {allowEmpty: true, cwd})
        .pipe($.if(env === 'dev', $.watch('project.config.json', {cwd}, function (event) {
            // console.log('处理'+event.path)
            writeLastLine('处理' + event.relative + '......')
        })))
        .pipe(gulp.dest(target, {cwd}))
})
