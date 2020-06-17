const gulp = require('gulp')
const fs = require('fs-extra')
const {
    cwd,
    basePath,
    base,
    program
} = require('../preset')

gulp.task('startToPackServe', gulp.series(
// 初始化
async function (done) {
    if (!(await (fs.exists(basePath)))) {
        await (fs.mkdirs(basePath))
    }
    done()
}, 'clean:base',
// 通过判断普通uni构建目录的app.json来识别是否完成了uni的第一次构建
function (done) {
    if (program.native) {
        done()
        return
    }
    // 使用原生的watch是为了只监听一次
    gulp.watch(base + '/app.json', {events: ['all'], cwd}, function () {
        done()
    })
}, 'mpWxSubMode'))
