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
    mpTypeNamespace
} = require('../preset')
const {writeLastLine} = require('../utils')
const {mixinsEnvCode} = require('../mixinAllEnv')
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
            // console.log('处理'+event.path)w
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
        .pipe(filterAllJs)
        .pipe($.replace(/[\s\S]*/, function (match) {
            const injectCode = mixinsEnvCode(match)
            return injectCode + match
        }, {
            skipBinary: false
        }))
        .pipe(filterAllJs.restore)
        .pipe(filterAppJs)
        .pipe($.replace(/^/, function (match) {
            if (packIsSubpackage.mode || program.plugin) return ''
            let packagePath = `./${projectToSubPackageConfig.subPackagePath}/`

            // 如果uniSubpackagePath是空或者根
            if (subModePath === targetPath) {
                // 获取uni的app.js的内容
                const uniAppJsContent = fs.readFileSync(basePath + '/app.js', 'utf8')
                return `${uniAppJsContent};\n`
            }

            return `require('${packagePath}app.js');\n`
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
        .pipe($.replace(/[\s\S]*/, runPlugins(path.resolve(cwd, target + (program.plugin ? '/miniprogram' : ''))), {
            skipBinary: false
        }))
        .pipe(gulp.dest(target + (program.plugin ? '/miniprogram' : ''), {cwd}));
})
