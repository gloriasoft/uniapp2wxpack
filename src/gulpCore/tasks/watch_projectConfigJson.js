const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const {cwd, target, env, targetPath, pluginProcessFileTypes, currentNamespace} = require('../preset')
const {writeLastLine} = require('../utils')
const {runPlugins} = require('../plugins')
gulp.task('watch:projectConfigJson', function () {
    const filterPluginsFiles = $.filter(pluginProcessFileTypes.map((fileType) => {
        return `/**/*.${fileType}`
    }), {restore: true})
    return gulp.src(currentNamespace.projectConfig, {allowEmpty: true, cwd})
        .pipe($.if(env === 'dev', $.watch(currentNamespace.projectConfig, {cwd}, function (event) {
            // console.log('处理'+event.path)
            writeLastLine('处理' + event.relative + '......')
        })))
        .pipe(filterPluginsFiles)
        .pipe($.replace(/[\s\S]*/, runPlugins(targetPath), {
            skipBinary: false
        }))
        .pipe(filterPluginsFiles.restore)
        .pipe(gulp.dest(target, {cwd}))
})
