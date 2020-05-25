const $ = require('gulp-load-plugins')()
const {
    regExpWxResources,
    regExpUniRequire,
} = require('./preset')
const {tryAgain, getLevelPath, getLevel, writeLastLine} = require('./utils')

exports.uniRequireWxResource = function uniRequireWxResource () {
    return $.replace(regExpUniRequire, function (match, p1, offset, string) {
        const pathLevel = getLevel(this.file.relative)
        console.log(`\n编译${match}-->require(${p1.replace(regExpWxResources, getLevelPath(pathLevel))})`)
        return `require(${p1.replace(regExpWxResources, getLevelPath(pathLevel))})`
    }, {
        skipBinary:false
    })
}
