const fs = require('fs-extra')
const chokidar = require('chokidar')

module.exports = function (path) {
    if (fs.existsSync(path)) {
        fs.removeSync(path)
    }
    const watcher = chokidar.watch(path)
    watcher.on('add', function () {
        fs.removeSync(path)
        watcher.close()
    })
}
