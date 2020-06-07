const path = require('path')
const { program } = require('commander');
program
    .option('--scope <type>', '运行目录', process.cwd())
    .option('--plugin', '插件模式')
    .option('--type <type>', '解耦包类型(哪种小程序)', 'weixin')
program.parse(process.argv);
const mpTypeNamespace = {
    weixin: {
        html: 'wxml',
        css: 'wxss',
        globalObject: 'wx'
    },
    baidu: {
        html: 'swan',
        css: 'css',
        globalObject: 'swan'
    },
    toutiao: {
        html: 'ttml',
        css: 'ttss',
        globalObject: 'tt'
    }
}
const currentNamespace = mpTypeNamespace[program.type]
if (!currentNamespace) throw Error('小程序类型错')
const cwd = program.scope
const projectToSubPackageConfig = require(path.resolve(cwd,'./projectToSubPackageConfig'))
const wxResourcePath = projectToSubPackageConfig.wxResourcePath || 'src/wxresource'
const wxResourceAlias = projectToSubPackageConfig.wxResourceAlias || '@wxResource'
const regExpWxResources = new RegExp(`${wxResourceAlias}\\/`,'g')
const uniRequireApiName = projectToSubPackageConfig.uniRequireApiName || '__uniRequireWx'
const regExpUniRequire = new RegExp(`${uniRequireApiName}\\(([a-zA-Z.\\/"'@\\d]+)\\)`,'g')
const uniImportWxssApiName = projectToSubPackageConfig.uniImportWxssApiName || '__uniWxss'
const regExpUniImportWxss = new RegExp(`(}|^|\\s|;)${uniImportWxssApiName}\\s*{([^{}]+)}`,'g')
const configWxResourceKey = projectToSubPackageConfig.configWxResourceKey || 'wxResource'

let env = 'dev'
if(process.env.NODE_ENV === 'production'){
    env = 'build'
}

const base = 'dist/' + env + '/mp-weixin'
let target = 'dist/' + env + '/mp-weixin-pack'
if (program.plugin) {
    target = 'dist/' + env + '/mp-weixin-pack-plugin'
}
const basePath = path.resolve(cwd, base)
const subModePath = path.resolve(cwd, target, projectToSubPackageConfig.subPackagePath)
const targetPath = path.resolve(cwd, target)
const packIsSubpackage = {
    mode: false
}

module.exports = {
    currentNamespace,
    program,
    cwd,
    projectToSubPackageConfig,
    wxResourcePath,
    wxResourceAlias,
    regExpWxResources,
    uniRequireApiName,
    regExpUniRequire,
    uniImportWxssApiName,
    regExpUniImportWxss,
    configWxResourceKey,
    env,
    base,
    target,
    basePath,
    subModePath,
    targetPath,
    packIsSubpackage
}
