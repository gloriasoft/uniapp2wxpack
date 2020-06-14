exports.tryAgain = async function tryAgain (awaitDone) {
    return new Promise(async (resolve) => {
        setTimeout(async () => {
            resolve(await awaitDone())
        }, 100)
    })
}

exports.getLevelPath = function getLevelPath (level) {
    let arr = Array(level)
    return arr.fill('../').join('')
}

exports.getLevel = function getLevel (relative) {
    return relative.split(/[\\/]/).length-1
}

let writeTimer
const log = require('single-line-log').stdout;
exports.writeLastLine = function writeLastLine (val) {
    log(val)
    clearTimeout(writeTimer)
    writeTimer = setTimeout(() => {
        log('解耦构建，正在监听中......(此过程如果出现权限问题，请使用管理员权限运行)')
    }, 300)
}

// 深层查找
exports.deepFind = function deepFind (child, callback, index, brotherNodes) {
    if (!callback) return
    callback(child, index, brotherNodes)
    if (!child.childNodes) return
    child.childNodes.forEach((child, index, arr) => {
        deepFind(child, callback, index, arr)
    })
}
