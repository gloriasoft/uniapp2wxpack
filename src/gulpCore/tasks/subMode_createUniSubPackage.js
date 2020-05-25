const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const fs = require('fs-extra')
const del = require('del')
const parse5 = require('parse5')
const path =require('path')
const strip = require('gulp-strip-comments')
const {fakeUniBootstrapName, fakeUniBootstrap} = require('../fakeUniBootstrapEs5')
const {
    cwd,
    env,
    program,
    basePath,
    targetPath,
    subModePath,
    base,
    regExpUniRequire,
    regExpWxResources,
    regExpUniImportWxss,
    wxResourceAlias
} = require('../preset')
const {writeLastLine, getLevel, getLevelPath} = require('../utils')
const {uniRequireWxResource} = require('../uniRequire')

// 如果uni的app.js和原生的app.js是同一个路径
function checkBaseAppJsIsTopAppJs (file) {
    const topAppJsPath = path.resolve(targetPath, 'app.js')
    const topAppWxssPath = path.resolve(targetPath, 'app.wxss')
    const currentFilePath = file.path.replace(basePath, subModePath)
    return topAppJsPath === currentFilePath || topAppWxssPath === currentFilePath
}

// 深层查找
function deepFind (child, callback) {
    if (!callback) return
    callback(child)
    if (!child.childNodes) return
    child.childNodes.forEach((child) => {
        deepFind(child, callback)
    })
}

gulp.task('subMode:createUniSubPackage', function(){
    fs.mkdirsSync(basePath)
    const f = $.filter([
        base + '/common/vendor.js',
        base + '/common/main.js',
        base + '/common/runtime.js',
        base + '/pages/**/*.js'
    ], {restore: true})
    const filterVendor = $.filter([base + '/common/vendor.js'], {restore: true})
    const filterMain = $.filter([base + '/common/main.js'], {restore: true})
    const filterJs = $.filter([
        base + '/**/*.js',
        '!' + base + '/app.js',
        '!' + base + '/common/vendor.js',
        '!' + base + '/common/main.js',
        '!' + base + '/common/runtime.js'
    ], {restore: true})
    const filterWxss = $.filter([
        base + '/**/*.wxss',
        '!' + base + '/app.wxss',
        '!' + base + '/common/main.wxss'
    ], {restore: true})
    const filterWxssIncludeMain = $.filter([
        base + '/**/*.wxss',
        '!' + base + '/app.wxss'
    ], {restore: true})
    const filterJson = $.filter([base + '/**/*.json'], {restore: true})
    const filterWxml = $.filter([base + '/**/*.wxml'], {restore: true})

    return gulp.src([
        base + '/**',
        '!' + base + '/*.*',
        base + '/app.js',
        base + '/app.wxss'
    ], {allowEmpty: true, cwd})
        .pipe($.if(env === 'dev', $.watch([base + '/**/*', '!/' + base + '/*.json'],{cwd}, function (event) {
            // console.log('处理'+event.path)
            writeLastLine('处理' + event.relative + '......')
        })))
        .pipe($.filter(function (file) {
            if (checkBaseAppJsIsTopAppJs(file)) return false
            if (file.event === 'unlink') {
                try {
                    del.sync([file.path.replace(basePath, path.resolve(cwd, subModePath))], {force: true})
                } catch (e) {}
                return false
            } else {
                return true
            }
        }))
        .pipe(filterWxml)
        .pipe($.replace(/[\s\S]*/, function (match) {
            const document = parse5.parse(match)
            let updated = 0
            // 直接获取body
            const body = document.childNodes[0].childNodes[1]
            deepFind(document, (child) => {
                // 修正img标签
                if (child.nodeName === 'img') {
                    child.nodeName = 'image'
                    child.tagName = 'image'
                }
                if (child.nodeName === '#text' && child.parentNode.nodeName === 'wxs') {
                    const valueMatch = child.value.replace(regExpUniRequire, (subMatch, p1, offset, string) => {
                        const pathLevel=getLevel(this.file.relative)
                        const resultPath = p1.replace(regExpWxResources,getLevelPath(pathLevel)).replace(/['"]/g, '')
                        child.parentNode.attrs.push({
                            name: 'src',
                            value: resultPath
                        })
                        child.parentNode.childNodes = []
                        updated = 1
                        console.log(`\n编译${subMatch}-->require(${resultPath})`)
                    })
                }
            })
            return updated ? parse5.serialize(body) : match
        }, {
            skipBinary: false
        }))
        .pipe(filterWxml.restore)
        .pipe(filterVendor)
        .pipe($.replace(/^/, function (match) {
            if (program.plugin) {
                return `var App=function(packInit){};wx.canIUse=function(){return false};`
            } else {
                return `var __packConfig=require('../pack.config.js');var App=function(packInit){var ${fakeUniBootstrapName}=${fakeUniBootstrap.toString()};${fakeUniBootstrapName}(packInit,__packConfig.packPath,__packConfig.appMode);};`
            }
        }, {
            skipBinary: false
        }))
        .pipe(filterVendor.restore)
        .pipe(f)
        .pipe(strip())
        .pipe(uniRequireWxResource())
        .pipe(f.restore)
        .pipe(filterMain)
        .pipe($.replace(/^/, function (match) {
            return `var __uniPluginExports={};\n`
        }, {
            skipBinary: false
        }))
        .pipe($.replace(/$/, function(match){
            return `\nmodule.exports=__uniPluginExports;`
        }, {
            skipBinary: false
        }))
        .pipe(filterMain.restore)
        .pipe(filterJs)
        .pipe($.replace(/^/, function (match) {
            if (fs.existsSync(path.resolve(cwd, 'src', this.file.relative))) {
                return match
            }
            let packagePath = getLevelPath(getLevel(this.file.relative))

            return `require('${packagePath}app.js');\n`
        }, {
            skipBinary: false
        }))
        .pipe(filterJs.restore)
        .pipe(filterJson)
        .pipe($.replace(/[\s\S]*/, function (match) {
            if (!fs.existsSync(path.resolve(cwd, 'src', this.file.relative.replace(/json$/,'vue'))) && !fs.existsSync(path.resolve(cwd, 'src', this.file.relative.replace(/json$/,'nvue')))){
                return match
            }
            let json = JSON.parse(this.file.contents.toString())
            for (let i in json.usingComponents) {
                if (json.usingComponents[i].indexOf('/') === 0) {
                    json.usingComponents[i] = getLevelPath(getLevel(this.file.relative)) + json.usingComponents[i].replace(/^\//, '')
                }
            }
            return JSON.stringify(json)
        }, {
            skipBinary: false
        }))
        .pipe(filterJson.restore)
        .pipe(filterWxssIncludeMain)
        .pipe($.stripCssComments())
        .pipe($.replace(regExpUniImportWxss, function (match, p1, p2) {
            let str = ''
            let pathLevel = getLevel(this.file.relative)
            ;(p2 + ';').replace(/\s*import\s*:\s*(('[^\s';]*')|("[^\s";]*"))/g, function (match, p1) {
                str += `@import ${p1.replace(regExpWxResources,getLevelPath(pathLevel))};\n`
            })
            return p1 + str
        }, {
            skipBinary: false
        }))
        .pipe(filterWxssIncludeMain.restore)
        .pipe(filterWxss)
        .pipe($.stripCssComments())
        .pipe($.replace(/^[\s\S]*$/, function (match) {
            if (subModePath === targetPath) return match
            let pathLevel = getLevel(this.file.relative)
            let mainWxss = `@import ${('"' + wxResourceAlias + '/app.wxss";').replace(regExpWxResources,getLevelPath(pathLevel))}`
            let result = `\n${match}`
            return mainWxss + result
        }, {
            skipBinary: false
        }))
        .pipe(filterWxss.restore)
        .pipe(gulp.dest(subModePath, {cwd}))
})
