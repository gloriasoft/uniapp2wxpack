const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const {cwd, target, env, base, targetPath, pluginProcessFileTypes} = require('../preset')
const {writeLastLine} = require('../utils')
const mergeToTargetJson = require('../mergeToTargetJson')
const {runPlugins} = require('../plugins')
gulp.task('watch:baseAppJson', function () {
    const filterPluginsFiles = $.filter(pluginProcessFileTypes.map((fileType) => {
        return `${base}/**/*.${fileType}`
    }), {restore: true})
    return gulp.src(base + '/app.json', {allowEmpty: true, cwd})
        .pipe($.if(env === 'dev', $.watch(base + '/app.json', {cwd}, function (event) {
            // console.log('处理'+event.path)
            writeLastLine('处理' + event.relative + '......')
        })))
        .pipe(mergeToTargetJson('baseAppJson'))
        .pipe(filterPluginsFiles)
        .pipe($.replace(/[\s\S]*/, runPlugins(targetPath), {
            skipBinary: false
        }))
        .pipe(filterPluginsFiles.restore)
        .pipe(gulp.dest(target, {cwd}))
})
