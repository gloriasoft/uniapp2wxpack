const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const fs = require('fs-extra')
const del = require('del')
const nodeAst = require('../nodeAst')
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
    wxResourceAlias,
    currentNamespace,
    mpTypeNamespace,
    pluginProcessFileTypes,
    sourceCodePath
} = require('../preset')
const platform = process.env.PACK_TYPE
const {writeLastLine, getLevel, getLevelPath, deepFind} = require('../utils')
const {mixinsEnvCode} = require('../mixinAllEnv')
const {uniRequireWxResource} = require('../uniRequire')
const {runPlugins} = require('../plugins')
const cssArr = Object.keys(mpTypeNamespace).map((key) => {
    return mpTypeNamespace[key].css
})
const cssSet = new Set(cssArr)
const injectAppCss = require('../injectAppCss')

// 如果uni的app.js和原生的app.js是同一个路径
function checkBaseAppJsIsTopAppJs (file) {
    const topAppJsPath = path.resolve(targetPath, 'app.js')
    const topAppWxssPath = path.resolve(targetPath, `app.${currentNamespace.css}`)
    const currentFilePath = file.path.replace(basePath, subModePath)
    return topAppJsPath === currentFilePath || topAppWxssPath === currentFilePath
}

gulp.task('subMode:createUniSubPackage', function(){
    fs.mkdirsSync(basePath)
    const filterAllJs = $.filter(base + '/**/*.js', {restore: true})
    const filterVendor = $.filter([base + '/common/vendor.js'], {restore: true})
    const filterMain = $.filter([base + '/common/main.js'], {restore: true})
    const filterPluginsFiles = $.filter(pluginProcessFileTypes.map((fileType) => {
        return `${base}/**/*.${fileType}`
    }), {restore: true})
    const filterJs = $.filter([
        base + '/**/*.js',
        '!' + base + '/app.js',
        '!' + base + '/common/vendor.js',
        '!' + base + '/common/main.js',
        '!' + base + '/common/runtime.js'
    ], {restore: true})
    const filterWxss = $.filter([
        `${base}/**/*.${currentNamespace.css}`,
        `!${base}/app.${currentNamespace.css}`,
        `!${base}/common/main.${currentNamespace.css}`
    ], {restore: true})
    const filterWxssIncludeMain = $.filter([
        `${base}/**/*.${currentNamespace.css}`,
        `!${base}/app.${currentNamespace.css}`
    ], {restore: true})
    const filterJson = $.filter([base + '/**/*.json'], {restore: true})
    const filterWxml = $.filter([`${base}/**/*.${currentNamespace.html}`], {restore: true})


    return gulp.src([
        base + '/**',
        '!' + base + '/*.*',
        base + '/app.js',
        `${base}/app.${currentNamespace.css}`
    ], {allowEmpty: true, cwd})
        .pipe($.if(env === 'dev', $.watch([base + '/**/*', '!/' + base + '/*.json'],{cwd}, function (event) {
            // console.log('处理'+event.path)
            writeLastLine('处理' + event.relative + '......')
        })))
        .pipe($.filter(function (file) {
            if (checkBaseAppJsIsTopAppJs(file)) return false
            if (file.event === 'unlink') {
                try {
                    let filePath = file.path
                    const extNameRegExp = new RegExp(`${file.extname}$`, 'i')
                    if (cssSet.has(file.extname.substr(1))) {
                        filePath = filePath.replace(extNameRegExp, '.' + currentNamespace.css)
                    }
                    del.sync([filePath.replace(basePath, path.resolve(cwd, subModePath))], {force: true})
                } catch (e) {}
                return false
            } else {
                return true
            }
        }))
        .pipe(filterWxml)
        .pipe($.replace(/[\s\S]*/, function (match) {
            // 判断是否有css文件，如果没有，创建一个空的
            const cssPath = this.file.path.replace(new RegExp(`${currentNamespace.html}$`, 'i'), currentNamespace.css)
            const cssRelative = this.file.relative.replace(new RegExp(`${currentNamespace.html}$`, 'i'), currentNamespace.css)
            if (!fs.existsSync(cssPath)) {
                fs.outputFileSync(path.resolve(cwd, subModePath, cssRelative), injectAppCss('', cssRelative))
            }

            const ast = new nodeAst(match)
            let updated = 0
            deepFind(ast.topNode, (child) => {
                if (child.type === 1 && child.tag === 'wxs' && child.children.length === 1 && child.children[0].type === 3) {
                    const childText = child.children[0]
                    const valueMatch = childText.text.replace(regExpUniRequire, (subMatch, p1, offset, string) => {
                        const pathLevel = getLevel(this.file.relative)
                        const resultPath = p1.replace(regExpWxResources, getLevelPath(pathLevel)).replace(/['"]/g, '')
                        child.attrsMap.src = resultPath
                        child.children = []
                        updated = 1
                        console.log(`\n编译${subMatch}-->require(${resultPath})`)
                    })
                }
            })
            return updated ? ast.render() : match
        }, {
            skipBinary: false
        }))
        .pipe(filterWxml.restore)
        .pipe(filterVendor)
        .pipe($.replace(/^/, function (match) {
            if (program.plugin) {
                return `var App=function(packInit){};${currentNamespace.globalObject}.canIUse=function(){return false};`
            } else {
                return `var __packConfig=require('../pack.config.js');var App=function(packInit){var ${fakeUniBootstrapName}=${fakeUniBootstrap.toString().replace(/globalObject/g, currentNamespace.globalObject)};${fakeUniBootstrapName}(packInit,__packConfig.packPath,__packConfig.appMode,'${platform}');};`
            }
        }, {
            skipBinary: false
        }))
        .pipe(filterVendor.restore)
        .pipe(filterAllJs)
        .pipe(strip())
        .pipe(uniRequireWxResource())
        .pipe($.replace(/[\s\S]*/, function (match) {
            const injectCode = mixinsEnvCode(match)
            return injectCode + match
        }, {
            skipBinary: false
        }))
        .pipe(filterAllJs.restore)
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
            if (fs.existsSync(path.resolve(cwd, sourceCodePath, this.file.relative))) {
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
            if (!fs.existsSync(path.resolve(cwd, sourceCodePath, this.file.relative.replace(/json$/,'vue'))) && !fs.existsSync(path.resolve(cwd, sourceCodePath, this.file.relative.replace(/json$/,'nvue')))){
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
            p2 = p2 + ';'
            p2.replace(/\s*import\s*:\s*(('[^\s';]*')|("[^\s";]*"))/g, function (match, p1) {
                const reg = new RegExp(`(${cssArr.join('|')})(['"])$`)
                p1 = p1.replace(reg,`${currentNamespace.css}$2`)
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
            return injectAppCss(match, this.file.relative)
        }, {
            skipBinary: false
        }))
        .pipe(filterWxss.restore)
        .pipe(filterPluginsFiles)
        .pipe($.replace(/[\s\S]*/, runPlugins(subModePath), {
            skipBinary: false
        }))
        .pipe(filterPluginsFiles.restore)
        .pipe(gulp.dest(subModePath, {cwd}))
})
