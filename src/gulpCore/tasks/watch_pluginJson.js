const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const {cwd, projectToSubPackageConfig, target, env, pluginProcessFileTypes, sourceCodePath} = require('../preset')
const path = require('path')
const {writeLastLine} = require('../utils')
const {runPlugins} = require('../plugins')
gulp.task('watch:pluginJson', function () {
    const filterPluginsFiles = $.filter(pluginProcessFileTypes.map((fileType) => {
        return `/**/*.${fileType}`
    }), {restore: true})
    return gulp.src(sourceCodePath + '/plugin.json', {allowEmpty: true, cwd})
        .pipe($.if(env === 'dev', $.watch(sourceCodePath + '/plugin.json', {cwd}, function (event) {
            // console.log('处理'+event.path)
            writeLastLine('处理' + event.relative + '......')
        })))
        .pipe(filterPluginsFiles)
        .pipe($.replace(/[\s\S]*/, runPlugins(path.resolve(cwd, target + `/${projectToSubPackageConfig.subPackagePath}`)), {
            skipBinary: false
        }))
        .pipe(filterPluginsFiles.restore)
        .pipe(gulp.dest(target + `/${projectToSubPackageConfig.subPackagePath}`, {cwd}))
})
