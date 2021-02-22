const {currentNamespace, regExpWxResources, wxResourceAlias} = require('./preset')
const {getLevelPath, getLevel} = require('./utils')
function injectAppCss (match, relative) {
    const pathLevel = getLevel(relative)
    // const mainWxss = `@import ${(`"${wxResourceAlias}/common/main.${currentNamespace.css}";`).replace(regExpWxResources,getLevelPath(pathLevel))}`
    const mainWxss = `@import ${(`"${wxResourceAlias}/app.${currentNamespace.css}";`).replace(regExpWxResources,getLevelPath(pathLevel))}`
    let result = `\n${match}`
    return mainWxss + result
}

module.exports = injectAppCss
