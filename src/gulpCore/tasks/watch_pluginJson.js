const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const {cwd, projectToSubPackageConfig, target, env} = require('../preset')
const path = require('path')
const {writeLastLine} = require('../utils')
const {runPlugins} = require('../plugins')
gulp.task('watch:pluginJson', function () {
    return gulp.src('src/plugin.json', {allowEmpty: true, cwd})
        .pipe($.if(env === 'dev', $.watch('src/plugin.json', {cwd}, function (event) {
            // console.log('处理'+event.path)
            writeLastLine('处理' + event.relative + '......')
        })))
        .pipe($.replace(/[\s\S]*/, runPlugins(path.resolve(cwd, target + `/${projectToSubPackageConfig.subPackagePath}`)), {
            skipBinary: false
        }))
        .pipe(gulp.dest(target + `/${projectToSubPackageConfig.subPackagePath}`, {cwd}))
})
