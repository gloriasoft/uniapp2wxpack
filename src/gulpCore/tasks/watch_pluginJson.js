const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const {cwd, projectToSubPackageConfig: {subPackagePath}, target, env, pluginProcessFileTypes, sourceCodePath, currentNamespace: {pluginConfig}} = require('../preset')
const path = require('path')
const {writeLastLine} = require('../utils')
const {runPlugins} = require('../plugins')
gulp.task('watch:pluginJson', function () {
    const filterPluginsFiles = $.filter(pluginProcessFileTypes.map((fileType) => {
        return `**/*.${fileType}`
    }), {restore: true})
    const gulpSrcPath = `${sourceCodePath}/${pluginConfig}`
    return gulp.src(gulpSrcPath, {allowEmpty: true, cwd})
        .pipe($.if(env === 'dev', $.watch(gulpSrcPath, {cwd}, function (event) {
            // console.log('处理'+event.path)
            writeLastLine('处理' + event.relative + '......')
        })))
        .pipe(filterPluginsFiles)
        .pipe($.replace(/[\s\S]*/, runPlugins(path.resolve(cwd, target + `/${subPackagePath}`)), {
            skipBinary: false
        }))
        .pipe(filterPluginsFiles.restore)
        .pipe(gulp.dest(target + `/${subPackagePath}`, {cwd}))
})
