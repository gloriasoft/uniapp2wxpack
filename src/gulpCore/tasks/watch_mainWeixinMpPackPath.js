const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const del = require('del')
const path = require('path')
const fs = require('fs-extra')
const {cwd, target, env, projectToSubPackageConfig, base, wxResourcePath, currentNamespace, mpTypeNamespace, pluginProcessFileTypes} = require('../preset')
const {writeLastLine} = require('../utils')
const {runPlugins} = require('../plugins')
function checkMainPackFileCanResolve (file) {
    const mainPath = projectToSubPackageConfig[currentNamespace.mainMpPath] + '/' + projectToSubPackageConfig.subPackagePath
    // 先判断base里是否有文件
    if (fs.existsSync(file.path.replace(path.resolve(cwd, mainPath), path.resolve(cwd, base)))) return false
    // 在判断wxresource里是否有文件
    return !fs.existsSync(file.path.replace(path.resolve(cwd, mainPath), path.resolve(cwd, wxResourcePath)));
}
gulp.task('watch:mainWeixinMpPackPath', function () {
    const base = projectToSubPackageConfig[currentNamespace.mainMpPath]
    const basePackPath = base + '/' + projectToSubPackageConfig.subPackagePath
    const packTarget = target + '/' + projectToSubPackageConfig.subPackagePath
    const cssPathArr = []
    const htmlPathArr = []
    const cssExtNameSet = new Set()
    const htmlExtNameSet = new Set()
    Object.keys(mpTypeNamespace).forEach((key) => {
        cssPathArr.push(`${basePackPath}/**/*.${mpTypeNamespace[key].css}`)
        htmlPathArr.push(`${basePackPath}/**/*.${mpTypeNamespace[key].html}`)
        cssExtNameSet.add('.' + mpTypeNamespace[key].css)
        htmlExtNameSet.add('.' + mpTypeNamespace[key].html)
    })
    const filterAllHtml = $.filter([...htmlPathArr], {restore: true})
    const filterAllCss = $.filter([...cssPathArr], {restore: true})
    const filterAllJs = $.filter([basePackPath + '/**/*.js'], {restore: true})
    const filterPluginsFiles = $.filter(pluginProcessFileTypes.map((fileType) => {
        return `${basePackPath}/**/*.${fileType}`
    }), {restore: true})
    return gulp.src([
        basePackPath,
        basePackPath + '/**/*',
        '!' + basePackPath + '/pack.config.js'
    ], {allowEmpty: true, cwd})
        .pipe($.if (env === 'dev', $.watch([basePackPath, basePackPath + '/**/*', '!/' + basePackPath + '/pack.config.js'], {cwd}, function (event) {
            // console.log('处理'+event.path)
            writeLastLine('处理' + event.relative + '......')
        })))
        .pipe($.filter(function (file) {
            if (file.relative !== currentNamespace.projectConfig && !checkMainPackFileCanResolve(file)) return false
            if (file.event === 'unlink') {
                try {
                    let filePath = file.path
                    const extNameRegExp = new RegExp(`${file.extname}$`, 'i')
                    if (cssExtNameSet.has(file.extname)) {
                        filePath = filePath.replace(extNameRegExp, '.' + currentNamespace.css)
                    }
                    if (htmlExtNameSet.has(file.extname)) {
                        filePath = filePath.replace(extNameRegExp, '.' + currentNamespace.html)
                    }
                    del.sync([filePath.replace(path.resolve(cwd, base), path.resolve(cwd, target))], {force: true})
                } catch (e) { }
                return false
            } else {
                return true
            }
        }))
        .pipe(filterAllHtml)
        .pipe($.rename(function (path) {
            path.extname = '.' + currentNamespace.html
        }))
        .pipe(filterAllHtml.restore)
        .pipe(filterAllCss)
        .pipe($.rename(function (path) {
            path.extname = '.' + currentNamespace.css
        }))
        .pipe(filterAllCss.restore)
        .pipe(filterPluginsFiles)
        .pipe($.replace(/[\s\S]*/, runPlugins(path.resolve(cwd, packTarget)), {
            skipBinary: false
        }))
        .pipe(filterPluginsFiles.restore)
        .pipe(gulp.dest(packTarget, {cwd}))
})
