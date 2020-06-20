const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const {cwd, target, env, targetPath} = require('../preset')
const {writeLastLine} = require('../utils')
const {runPlugins} = require('../plugins')
gulp.task('watch:projectConfigJson', function () {
    return gulp.src('project.config.json', {allowEmpty: true, cwd})
        .pipe($.if(env === 'dev', $.watch('project.config.json', {cwd}, function (event) {
            // console.log('处理'+event.path)
            writeLastLine('处理' + event.relative + '......')
        })))
        .pipe($.replace(/[\s\S]*/, runPlugins(targetPath), {
            skipBinary: false
        }))
        .pipe(gulp.dest(target, {cwd}))
})
