const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const del = require('del')
const path =require('path')
const strip = require('gulp-strip-comments')
const {
    cwd,
    env,
    targetPath,
    subModePath,
    regExpWxResources,
    regExpUniImportWxss,
    wxResourceAlias,
    wxResourcePath,
    currentNamespace
} = require('../preset')
const {writeLastLine, getLevel, getLevelPath} = require('../utils')
const {uniRequireWxResource} = require('../uniRequire')

gulp.task('subMode:copyWxResource', function () {
    const filterJs = $.filter([wxResourcePath + '/**/*.js'], {restore: true})
    const filterWxss = $.filter([`${wxResourcePath}/**/*.${currentNamespace.css}`], {restore: true})
    return gulp.src([wxResourcePath + '/**', wxResourcePath], {allowEmpty: true, cwd})
        .pipe($.if(env === 'dev', $.watch([
            wxResourcePath + '/**',
            wxResourcePath,
            `!/${wxResourcePath}/**/*.*___jb_tmp___`
        ], {cwd}, function (event) {
            // console.log('处理'+event.path)
            writeLastLine('处理' + event.relative + '......')
        })))
        .pipe(filterJs)
        .pipe($.replace(/^/, function (match) {
            let packagePath = getLevelPath(getLevel(this.file.relative))
            return `require('${packagePath}app.js');\n`
        }, {
            skipBinary: false
        }))
        .pipe(strip())
        .pipe(uniRequireWxResource())
        .pipe(filterJs.restore)
        .pipe(filterWxss)
        .pipe($.stripCssComments())
        .pipe($.replace(regExpUniImportWxss, function(match, p1, p2) {
            let str = ''
            let pathLevel = getLevel(this.file.relative)
            ;(p2 + ';').replace(/\s*import\s*:\s*(('[^\s']*')|("[^\s']*"))/g, function (match, p1) {
                str += `@import ${p1.replace(regExpWxResources,getLevelPath(pathLevel))};\n`
            })
            return p1 + str
        }, {
            skipBinary: false
        }))
        .pipe($.replace(/^[\s\S]*$/, function (match) {
            if (subModePath === targetPath) return match
            let pathLevel = getLevel(this.file.relative)
            let mainWxss = `@import ${(`"${wxResourceAlias}/app.${currentNamespace.css}";`).replace(regExpWxResources,getLevelPath(pathLevel))}`
            let result = `\n${match}`
            return mainWxss + result
        }, {
            skipBinary: false
        }))
        .pipe(filterWxss.restore)
        .pipe($.filter(function (file) {
            if (file.event === 'unlink') {
                try {
                    del.sync([file.path.replace(path.resolve(cwd, wxResourcePath), path.resolve(cwd, subModePath))], {force: true})
                } catch (e) {}
                return false
            } else {
                return true
            }
        }))
        .pipe(gulp.dest(subModePath, {cwd}));
})
