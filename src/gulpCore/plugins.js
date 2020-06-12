const {projectToSubPackageConfig} = require('./preset')
function runPlugins (match) {
    const {plugins} = projectToSubPackageConfig
    if (!plugins || !plugins instanceof Array) {
        return
    }
    return plugins.reduce((prevMatch, plugin) => {
        if (typeof plugin !== 'function') {
            return prevMatch
        }
        const result = plugin.call(this, match)
        if (result == null) return prevMatch
        return result
    }, match)
}

module.exports = {
    runPlugins
}
