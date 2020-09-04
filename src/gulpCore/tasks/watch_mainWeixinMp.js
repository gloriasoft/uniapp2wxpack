const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const del = require('del')
const path = require('path')
const {
    cwd,
    target,
    env,
    projectToSubPackageConfig,
    basePath,
    subModePath,
    targetPath,
    program,
    packIsSubpackage,
    currentNamespace,
    mpTypeNamespace,
    pluginProcessFileTypes
} = require('../preset')
const {writeLastLine} = require('../utils')
const {runPlugins} = require('../plugins')
gulp.task('watch:mainWeixinMp', function () {
    const base = projectToSubPackageConfig[currentNamespace.mainMpPath]
    const basePackPath = base + '/' + projectToSubPackageConfig.subPackagePath
    const cssPathArr = []
    const htmlPathArr = []
    const cssExtNameSet = new Set()
    const htmlExtNameSet = new Set()
    Object.keys(mpTypeNamespace).forEach((key) => {
        cssPathArr.push(`${base}/**/*.${mpTypeNamespace[key].css}`)
        htmlPathArr.push(`${base}/**/*.${mpTypeNamespace[key].html}`)
        cssExtNameSet.add('.' + mpTypeNamespace[key].css)
        htmlExtNameSet.add('.' + mpTypeNamespace[key].html)
    })
    const filterAppJs = $.filter([base + '/app.js'], {restore: true})
    const filterAllJs = $.filter([base + '/**/*.js'], {restore: true})
    const filterAllHtml = $.filter([...htmlPathArr], {restore: true})
    const filterAllCss = $.filter([...cssPathArr], {restore: true})
    const filterPluginsFiles = $.filter(pluginProcessFileTypes.map((fileType) => {
        return `${base}/**/*.${fileType}`
    }), {restore: true})
    return gulp.src([
        base+'/**/*',
        '!'+base+'/app.json',
        '!' + base + '/**/*.json___jb_tmp___',
        '!' + base + `/**/*.${currentNamespace.html}___jb_tmp___`,
        '!' + base + `/**/*.${currentNamespace.css}___jb_tmp___`,
        '!' + base + '/**/*.js___jb_tmp___',
        '!' + basePackPath + '/**/*'
    ], {base: path.resolve(cwd, base), allowEmpty: true, cwd})
        .pipe($.if(env === 'dev', $.watch([base + '/**/*', '!/' + base + '/app.json', '!/' + basePackPath + '/**/*'], {cwd}, function (event) {
            if (event.relative.match(/.json/)) {
                // console.log('1111111111处理'+event.relative)
            }
            writeLastLine('处理' + event.relative + '......')
        })))
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
                    del.sync([filePath.replace(path.resolve(cwd, base), path.resolve(cwd, target))], {force: true})
                } catch (e) {}
                return false
            } else {
                return true
            }
        }))
        .pipe(filterAppJs)
        .pipe($.replace(/[\s\S]*/, function (content) {
            if (packIsSubpackage.mode || program.plugin) return content
            let packagePath = `./${projectToSubPackageConfig.subPackagePath}/`
            let bootStrapJs = 'app.js'
            if (subModePath === targetPath) {
                bootStrapJs = 'uni-bootstrap.js'
            }

            if (content.match(new RegExp(`require\\('${packagePath.replace(/\./g, '\\.')}app.js'\\)`))) {
                return content
            }
            return `require('${packagePath}${bootStrapJs}');\n${content}`
        }, {
            skipBinary:false
        }))
        .pipe(filterAppJs.restore)
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
        .pipe($.replace(/[\s\S]*/, runPlugins(path.resolve(cwd, target + (program.plugin ? '/miniprogram' : ''))), {
            skipBinary: false
        }))
        .pipe(filterPluginsFiles.restore)
        .pipe(gulp.dest(target + (program.plugin ? '/miniprogram' : ''), {cwd}));
})
