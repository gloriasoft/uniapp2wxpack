const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const del = require('del')
const path = require('path')
const fs = require('fs-extra')
const {cwd, target, env, projectToSubPackageConfig, base, wxResourcePath, currentNamespace} = require('../preset')
const {writeLastLine} = require('../utils')
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
            if (!checkMainPackFileCanResolve(file)) return false
            if (file.event === 'unlink') {
                try {
                    del.sync([file.path.replace(path.resolve(cwd, base), path.resolve(cwd, target))], {force: true})
                } catch (e) { }
                return false
            } else {
                return true
            }
        }))
        .pipe(gulp.dest(packTarget, {cwd}))
})
