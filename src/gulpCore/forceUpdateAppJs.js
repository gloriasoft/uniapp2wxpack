const fs = require('fs-extra')
const path = require('path')
const Vinyl = require('vinyl')
const {runPlugins} = require('./plugins')
const {
    program,
    cwd,
    projectToSubPackageConfig,
    basePath,
    subModePath,
    targetPath,
    packIsSubpackage,
    currentNamespace,
    target,
    pluginTypeMiniProgramRoot
} = require('./preset')

function forceUpdateAppJs () {
    if (program.plugin) return

    // 因为要判断是不是把uni作为了分包，要重新刷新app.js
    const appJsPath = path.resolve(cwd,projectToSubPackageConfig[currentNamespace.mainMpPath] +'/app.js')
    if(fs.existsSync(appJsPath)){
        const appJs = fs.readFileSync(appJsPath,'utf8')
        let packagePath=`./${projectToSubPackageConfig.subPackagePath}/`
        let bootStrapJs = 'app.js'
        if (subModePath === targetPath) {
            bootStrapJs = 'uni-bootstrap.js'
        }
        let insertJs = `require('${packagePath}${bootStrapJs}');\n`
        if (packIsSubpackage.mode || program.plugin) insertJs = ''
        // 创建一个vinyl，用于给插件消费
        const appJsVinyl = new Vinyl({
            cwd,
            base: path.resolve(cwd,projectToSubPackageConfig[currentNamespace.mainMpPath]),
            path: appJsPath,
            // contents: new Buffer(insertJs + appJs)
        });
        fs.outputFileSync(targetPath + '/' + appJsVinyl.relative, runPlugins(path.resolve(cwd, target + (program.plugin ? `/${pluginTypeMiniProgramRoot}` : ''))).call({
            file: appJsVinyl
        }, insertJs + appJs))
    }
}

module.exports = forceUpdateAppJs
