const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const {cwd, target, env, projectToSubPackageConfig, program, basePath} = require('../preset')
const {writeLastLine} = require('../utils')
gulp.task('watch:topMode-mainAppJsAndAppWxss', function () {
    let base = projectToSubPackageConfig.mainWeixinMpPath
    const filterAppWxss = $.filter([base + '/app.wxss'], {restore: true})
    const filterAppJs = $.filter([base + '/app.js'], {restore: true})
    return gulp.src([base + '/app.js', base + '/app.wxss'], {allowEmpty: true, cwd})
        .pipe($.if(env === 'dev',$.watch([base + '/app.js', base + '/app.wxss'], {cwd}, function (event) {
            // console.log('处理'+event.path)
            writeLastLine('处理' + event.relative + '......')
        })))
        .pipe(filterAppJs)
        .pipe($.replace(/^/, function (match) {
            const uniAppJsContent = fs.readFileSync(basePath + '/app.js', 'utf8')
            return `${uniAppJsContent};\n`
        }, {
            skipBinary: false
        }))
        .pipe(filterAppJs.restore)
        .pipe(filterAppWxss)
        .pipe($.replace(/^/, function (match) {
            const uniAppWxssContent = fs.readFileSync(basePath + '/app.wxss', 'utf8')
            return `${uniAppWxssContent}\n`
        }, {
            skipBinary: false
        }))
        .pipe(filterAppWxss.restore)
        .pipe(gulp.dest(target + (program.plugin ? '/miniprogram' : ''), {cwd}))
})
