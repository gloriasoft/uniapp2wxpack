const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const {cwd, target, env, projectToSubPackageConfig, program, currentNamespace, pluginProcessFileTypes} = require('../preset')
const path = require('path')
const {writeLastLine} = require('../utils')
const mergeToTargetJson = require('../mergeToTargetJson')
const {runPlugins} = require('../plugins')
gulp.task('watch:mainAppJson', function () {
    const base = projectToSubPackageConfig[currentNamespace.mainMpPath]
    const filterPluginsFiles = $.filter(pluginProcessFileTypes.map((fileType) => {
        return `${base}/**/*.${fileType}`
    }), {restore: true})
    return gulp.src(base + '/app.json', {allowEmpty: true, cwd})
        .pipe($.if(env === 'dev', $.watch(base + '/app.json', {cwd}, function (event) {
            // console.log('处理'+event.path)
            writeLastLine('处理' + event.relative + '......')
        })))
        .pipe(mergeToTargetJson('mainAppJson'))
        .pipe(filterPluginsFiles)
        .pipe($.replace(/[\s\S]*/, runPlugins(path.resolve(cwd, target + (program.plugin ? '/miniprogram' : ''))), {
            skipBinary: false
        }))
        .pipe(filterPluginsFiles.restore)
        .pipe(gulp.dest(target + (program.plugin ? '/miniprogram' : ''), {cwd}))
})
