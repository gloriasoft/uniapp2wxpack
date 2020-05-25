const del = require('del')
const gulp = require('gulp')
const {subModePath} = require('../preset')
const {tryAgain} = require('../utils')
gulp.task('clean:subModePath', async function f (done) {
    try {
        await del([subModePath + '/**/*'], {force: true})
    } catch (e) {
        await tryAgain(async () => {
            await f(done)
        })
        return
    }
    done()
});
