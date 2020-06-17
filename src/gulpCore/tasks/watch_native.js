const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const del = require('del')
const path = require('path')
const {
    cwd,
    target,
    env,
    projectToSubPackageConfig,
    program,
    currentNamespace,
    mpTypeNamespace
} = require('../preset')
const {writeLastLine} = require('../utils')
const {mixinsEnvCode} = require('../mixinAllEnv')
const {runPlugins} = require('../plugins')
gulp.task('watch:native', function () {
    const base = projectToSubPackageConfig[currentNamespace.mainMpPath]
    const cssPathArr = []
    const htmlPathArr = []
    Object.keys(mpTypeNamespace).forEach((key) => {
        cssPathArr.push(`${base}/**/*.${mpTypeNamespace[key].css}`)
        htmlPathArr.push(`${base}/**/*.${mpTypeNamespace[key].html}`)
    })
    const filterAllJs = $.filter([base + '/**/*.js'], {restore: true})
    const filterAllHtml = $.filter([...htmlPathArr], {restore: true})
    const filterAllCss = $.filter([...cssPathArr], {restore: true})
    return gulp.src([base+'/**/*'], {base: path.resolve(cwd, base), allowEmpty: true, cwd})
        .pipe($.if(env === 'dev', $.watch([base + '/**/*'], {cwd}, function (event) {
            writeLastLine('处理' + event.relative + '......')
        })))
        .pipe($.filter(function (file) {
            if (file.event === 'unlink') {
                try {
                    del.sync([file.path.replace(path.resolve(cwd, base), path.resolve(cwd, target))], {force: true})
                } catch (e) {}
                return false
            } else {
                return true
            }
        }))
        .pipe(filterAllJs)
        .pipe($.replace(/[\s\S]*/, function (match) {
            const injectCode = mixinsEnvCode(match)
            return injectCode + match
        }))
        .pipe(filterAllJs.restore)
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
        .pipe($.replace(/[\s\S]*/, runPlugins(path.resolve(cwd, target + (program.plugin ? '/miniprogram' : '')))))
        .pipe(gulp.dest(target, {cwd}));
})
