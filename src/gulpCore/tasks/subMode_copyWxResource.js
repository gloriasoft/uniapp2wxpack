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
    currentNamespace,
    mpTypeNamespace,
    pluginProcessFileTypes
} = require('../preset')
const {writeLastLine, getLevel, getLevelPath} = require('../utils')
const {mixinsEnvCode} = require('../mixinAllEnv')
const {uniRequireWxResource} = require('../uniRequire')
const {runPlugins} = require('../plugins')
const cssArr = []
const cssPathArr = []
const htmlPathArr = []
const cssExtNameSet = new Set()
const htmlExtNameSet = new Set()
const injectAppCss = require('../injectAppCss')

Object.keys(mpTypeNamespace).forEach((key) => {
    cssArr.push(mpTypeNamespace[key].css)
    cssPathArr.push(`${wxResourcePath}/**/*.${mpTypeNamespace[key].css}`)
    htmlPathArr.push(`${wxResourcePath}/**/*.${mpTypeNamespace[key].html}`)
    cssExtNameSet.add('.' + mpTypeNamespace[key].css)
    htmlExtNameSet.add('.' + mpTypeNamespace[key].html)
})

gulp.task('subMode:copyWxResource', function () {
    const filterJs = $.filter([wxResourcePath + '/**/*.js'], {restore: true})
    const filterWxss = $.filter([...cssPathArr], {restore: true})
    const filterHtml = $.filter([...htmlPathArr], {restore: true})
    const filterPluginsFiles = $.filter(pluginProcessFileTypes.map((fileType) => {
        return `${wxResourcePath}/**/*${fileType}`
    }), {restore: true})
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
        .pipe($.replace(/[\s\S]*/, function (match) {
            const injectCode = mixinsEnvCode(match)
            return injectCode + match
        }, {
            skipBinary: false
        }))
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
                const reg = new RegExp(`(${cssArr.join('|')})(['"])$`)
                p1 = p1.replace(reg,`${currentNamespace.css}$2`)
                str += `@import ${p1.replace(regExpWxResources, getLevelPath(pathLevel))};\n`
            })
            return p1 + str
        }, {
            skipBinary: false
        }))
        .pipe($.replace(/^[\s\S]*$/, function (match) {
            if (subModePath === targetPath) return match
            return injectAppCss(match, this.file.relative)
        }, {
            skipBinary: false
        }))
        .pipe($.rename(function (path) {
            path.extname = '.' + currentNamespace.css
        }))
        .pipe(filterWxss.restore)
        .pipe(filterHtml)
        .pipe($.rename(function (path) {
            path.extname = '.' + currentNamespace.html
        }))
        .pipe(filterHtml.restore)
        .pipe($.filter(function (file) {
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
                    del.sync([filePath.replace(path.resolve(cwd, wxResourcePath), path.resolve(cwd, subModePath))], {force: true})
                } catch (e) {}
                return false
            } else {
                return true
            }
        }))
        .pipe(filterPluginsFiles)
        .pipe($.replace(/[\s\S]*/, runPlugins(subModePath), {
            skipBinary: false
        }))
        .pipe(filterPluginsFiles.restore)
        .pipe(gulp.dest(subModePath, {cwd}));
})
