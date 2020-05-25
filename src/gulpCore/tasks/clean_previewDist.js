const del = require('del')
const gulp = require('gulp')
const {targetPath} = require('../preset')
const {tryAgain} = require('../utils')
gulp.task('clean:previewDist', async function f (done) {
    try {
        await del([targetPath + '/**/*'], {force: true})
    } catch (e) {
        await tryAgain(async () => {
            await f(done)
        })
        return
    }
    done()
});
