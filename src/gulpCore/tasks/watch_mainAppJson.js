const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const {cwd, target, env, projectToSubPackageConfig, program, currentNamespace} = require('../preset')
const {writeLastLine} = require('../utils')
const mergeToTargetJson = require('../mergeToTargetJson')
gulp.task('watch:mainAppJson', function () {
    let base = projectToSubPackageConfig[currentNamespace.mainMpPath]
    return gulp.src(base + '/app.json', {allowEmpty: true, cwd})
        .pipe($.if(env === 'dev', $.watch(base + '/app.json', {cwd}, function (event) {
            // console.log('处理'+event.path)
            writeLastLine('处理' + event.relative + '......')
        })))
        .pipe(mergeToTargetJson('mainAppJson'))
        .pipe(gulp.dest(target + (program.plugin ? '/miniprogram' : ''), {cwd}))
})
