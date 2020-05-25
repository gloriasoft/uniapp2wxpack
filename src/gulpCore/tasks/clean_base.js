const del = require('del')
const gulp = require('gulp')
const {basePath} = require('../preset')
const {tryAgain} = require('../utils')
gulp.task('clean:base', async function f (done) {
    try {
        await del([basePath + '/**/*'], {force: true})
    } catch (e) {
        await tryAgain(async () => {
            await f(done)
        })
        return
    }
    done()
});
