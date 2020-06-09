const fs = require('fs-extra')
const path = require('path')
const {
    program,
    cwd,
    projectToSubPackageConfig,
    basePath,
    subModePath,
    targetPath,
    packIsSubpackage,
    currentNamespace
} = require('./preset')

function forceUpdateAppJs () {
    if (program.plugin) return

    // 因为要判断是不是把uni作为了分包，要重新刷新app.js
    const appJsPath = path.resolve(cwd,projectToSubPackageConfig[currentNamespace.mainMpPath] +'/app.js')
    if(fs.existsSync(appJsPath)){
        const appJs = fs.readFileSync(appJsPath,'utf8')
        let packagePath=`./${projectToSubPackageConfig.subPackagePath}/`
        let insertJs = `require('${packagePath}app.js');\n`
        // 如果uniSubpackagePath是空或者根
        if (subModePath === targetPath) {
            // 获取uni的app.js的内容
            const uniAppJsContent = fs.readFileSync(basePath + '/app.js', 'utf8')
            insertJs = `${uniAppJsContent};\n`
        }
        if (packIsSubpackage.mode || program.plugin) insertJs = ''
        fs.outputFileSync(targetPath + '/app.js', insertJs + appJs)
    }
}

module.exports = forceUpdateAppJs
