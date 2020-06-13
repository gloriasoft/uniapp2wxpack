const {projectToSubPackageConfig, targetPath} = require('./preset')
const path = require('path')
function runPlugins (root) {
    return function (match) {
        const {plugins} = projectToSubPackageConfig
        if (!plugins || !plugins instanceof Array) {
            return
        }
        return plugins.reduce((prevMatch, plugin) => {
            if (typeof plugin !== 'function') {
                return prevMatch
            }
            const absolutePath = path.resolve(root, this.file.relative)
            const pathObject = {
                relative: absolutePath.replace(new RegExp(`^${targetPath.replace(/\\/g, '\\\\')}`), '').replace(/\\/g, '/'),
                absolute: absolutePath
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
