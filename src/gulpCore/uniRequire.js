const $ = require('gulp-load-plugins')()
const {
    regExpWxResources,
    regExpUniRequire,
} = require('./preset')
const {getLevelPath, getLevel} = require('./utils')
function uniRequireWxResource () {
    return $.replace(/[\s\S]*/, function (match, p1) {
        const injectList = ['var __uniRequireInject={};\n']
        const pathLevel = getLevel(this.file.relative)
        match = match.replace(regExpUniRequire, (match, p1) => {
            console.log(`\n编译${match}-->require(${p1.replace(regExpWxResources, getLevelPath(pathLevel))})`)
            const injectKey = p1.replace(regExpWxResources, getLevelPath(pathLevel))
            const cmd = `__uniRequireInject[${injectKey}] = require(${injectKey});\n`
            if (injectList.indexOf(cmd) < 0) {
                injectList.push(cmd)
            }
            return `__uniRequireInject[${injectKey}]`
        })
        if (injectList[1]) {
            return `${injectList.join('')} ${match}`
        }

        return match

    }, {
        skipBinary: false
    })
}
exports.uniRequireWxResource = uniRequireWxResource
