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
    currentNamespace
} = require('../preset')
const {writeLastLine} = require('../utils')
gulp.task('watch:mainWeixinMp', function () {
    let base = projectToSubPackageConfig[currentNamespace.mainMpPath]
    let basePackPath = base + '/' + projectToSubPackageConfig.subPackagePath
    let filterAppJs = $.filter([base + '/app.js'], {restore: true})
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
                    del.sync([file.path.replace(path.resolve(cwd, base), path.resolve(cwd, target))], {force: true})
                } catch (e) {}
                return false
            } else {
                return true
            }
        }))
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
        .pipe(gulp.dest(target + (program.plugin ? '/miniprogram' : ''), {cwd}));
})
