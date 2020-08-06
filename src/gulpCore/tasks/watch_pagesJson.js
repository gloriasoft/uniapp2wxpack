const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const {cwd, target, env, targetPath, pluginProcessFileTypes, sourceCodePath} = require('../preset')
const {writeLastLine} = require('../utils')
const mergeToTargetJson = require('../mergeToTargetJson')
const {runPlugins} = require('../plugins')
gulp.task('watch:pagesJson', function () {
    const filterPluginsFiles = $.filter(pluginProcessFileTypes.map((fileType) => {
        return `**/*.${fileType}`
    }), {restore: true})
    return gulp.src(sourceCodePath + '/pages.json', {allowEmpty: true, cwd})
        .pipe($.if(env === 'dev', $.watch(sourceCodePath + '/pages.json', {cwd}, function (event) {
            // console.log('处理'+event.path)
            writeLastLine('处理' + event.relative + '......')
        })))
        .pipe(mergeToTargetJson('pagesJson'))
        .pipe($.rename('app.json'))
        .pipe(filterPluginsFiles)
        .pipe($.replace(/[\s\S]*/, runPlugins(targetPath), {
            skipBinary: false
        }))
        .pipe(filterPluginsFiles.restore)
        .pipe(gulp.dest(target, {cwd}))
})
