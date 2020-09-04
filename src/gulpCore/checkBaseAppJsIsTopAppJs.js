const path = require('path')
const {
    basePath,
    targetPath,
    subModePath,
    currentNamespace
} = require('./preset')

// 如果uni的app.js和原生的app.js是同一个路径
function checkBaseAppJsIsTopAppJs (file) {
    const topAppJsPath = path.resolve(targetPath, 'app.js')
    const topAppWxssPath = path.resolve(targetPath, `app.${currentNamespace.css}`)
    const currentFilePath = file.path.replace(basePath, subModePath)
    return topAppJsPath === currentFilePath || topAppWxssPath === currentFilePath
}
module.exports = checkBaseAppJsIsTopAppJs
