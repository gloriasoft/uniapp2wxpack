const {projectToSubPackageConfig, targetPath} = require('./preset')
const path = require('path')
const defaultPluginMap = require('./plugins/index')
const removeAfterAdd = require('./removeAfterAdd')

if (!projectToSubPackageConfig.plugins || !projectToSubPackageConfig.plugins instanceof Array) {
    projectToSubPackageConfig.plugins = []
}
function runPlugins (root) {
    return function (match) {
        const {plugins} = projectToSubPackageConfig
        if (!plugins || !plugins instanceof Array) {
            return
        }
        return plugins.reduce((prevMatch, plugin) => {
            if (typeof plugin === 'string') {
                plugin = defaultPluginMap[plugin]
            }
            if (typeof plugin !== 'function') {
                return prevMatch
            }

            // 放在reduce里定义是为了跟踪自定义插件中更新了Vinyl对象中的属性
            const absolutePath = path.resolve(root, this.file.relative)
            const pathObject = {
                relative: absolutePath.replace(new RegExp(`^${targetPath.replace(/\\/g, '\\\\')}`), '').replace(/\\/g, '/'),
                absolute: absolutePath
            }
            // 给Vinyl对象绑定创建后删除该文件的方法
            this.removeAfterAdd = function (path) {
                path = path || absolutePath
                removeAfterAdd(path)
            }
            const result = plugin.call(this, prevMatch, pathObject, defaultPluginMap)
            if (result == null) return prevMatch
            return result
        }, match)
    }
}

module.exports = {
    runPlugins
}
