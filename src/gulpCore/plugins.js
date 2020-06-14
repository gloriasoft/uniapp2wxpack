const {projectToSubPackageConfig, targetPath} = require('./preset')
const path = require('path')
const htmlMixinPlugin = require('./plugins/htmlMixin')
const cssMixinPlugin = require('./plugins/cssMixin')
if (!projectToSubPackageConfig.plugins || !projectToSubPackageConfig.plugins instanceof Array) {
    projectToSubPackageConfig.plugins = []
}
// 内部插件，混写html和css
projectToSubPackageConfig.plugins.unshift(htmlMixinPlugin, cssMixinPlugin)
function runPlugins (root) {
    return function (match) {
        const {plugins} = projectToSubPackageConfig
        if (!plugins || !plugins instanceof Array) {
            return
        }
        const absolutePath = path.resolve(root, this.file.relative)
        const pathObject = {
            relative: absolutePath.replace(new RegExp(`^${targetPath.replace(/\\/g, '\\\\')}`), '').replace(/\\/g, '/'),
            absolute: absolutePath
        }
        return plugins.reduce((prevMatch, plugin) => {
            if (typeof plugin !== 'function') {
                return prevMatch
            }
            const result = plugin(prevMatch, pathObject)
            if (result == null) return prevMatch
            return result
        }, match)
    }
}

module.exports = {
    runPlugins
}
