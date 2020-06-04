const $ = require('gulp-load-plugins')()
const {
    regExpWxResources,
    regExpUniRequire,
} = require('./preset')
const {getLevelPath, getLevel} = require('./utils')

exports.uniRequireWxResource = function uniRequireWxResource () {
    return $.replace(regExpUniRequire, function (match, p1) {
        const pathLevel = getLevel(this.file.relative)
        console.log(`\n编译${match}-->require(${p1.replace(regExpWxResources, getLevelPath(pathLevel))})`)
        return `require(${p1.replace(regExpWxResources, getLevelPath(pathLevel))})`
    }, {
        skipBinary:false
    })
}
