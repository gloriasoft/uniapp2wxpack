const {projectToSubPackageConfig, targetPath} = require('./preset')
const path = require('path')
const defaultPluginMap = require('./plugins/index')

if (!projectToSubPackageConfig.plugins || !projectToSubPackageConfig.plugins instanceof Array) {
    projectToSubPackageConfig.plugins = []
}
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
            if (typeof plugin === 'string') {
                plugin = defaultPluginMap[plugin]
            }
            if (typeof plugin !== 'function') {
                return prevMatch
            }
            const result = plugin(prevMatch, pathObject, defaultPluginMap)
            if (result == null) return prevMatch
            return result
        }, match)
    }
}

module.exports = {
    runPlugins
}
