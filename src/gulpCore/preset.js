const path = require('path')
const { program } = require('commander');
program
    .option('--scope <type>', '运行目录', process.cwd())
    .option('--plugin', '插件模式')
    .option('--type <type>', '解耦包类型(哪种小程序)', 'weixin')
    .option('--native', '原生模式')
program.parse(process.argv);
// 支持多种小程序解耦构建，默认为微信
const mpTypeNamespace = {
    weixin: {
        html: 'wxml',
        css: 'wxss',
        globalObject: 'wx',
        mainMpPath: 'mainWeixinMpPath',
        directivePrefix: 'wx:'
    },
    baidu: {
        html: 'swan',
        css: 'css',
        globalObject: 'swan',
        mainMpPath: 'mainBaiduMpPath',
        directivePrefix: 's-'
    },
    toutiao: {
        html: 'ttml',
        css: 'ttss',
        globalObject: 'tt',
        mainMpPath: 'mainToutiaoMpPath',
        directivePrefix: 'tt:'
    },
    alipay: {
        html: 'axml',
        css: 'acss',
        globalObject: 'my',
        mainMpPath: 'mainAlipayMpPath',
        directivePrefix: 'a:'
    }
}
const currentNamespace = mpTypeNamespace[program.type]
if (!currentNamespace) throw Error('小程序类型错')
process.env.PACK_TYPE = program.type
const cwd = program.scope
const projectToSubPackageConfig = require(path.resolve(cwd,'./projectToSubPackageConfig'))
const sourceCodePath = projectToSubPackageConfig.sourceCodePath || 'src'
const wxResourcePath = projectToSubPackageConfig.wxResourcePath || `${sourceCodePath}/${currentNamespace.globalObject}resource`
const wxResourceAlias = projectToSubPackageConfig.wxResourceAlias || `@wxResource`
const regExpWxResources = new RegExp(`${wxResourceAlias}\\/`,'g')
const uniRequireApiName = projectToSubPackageConfig.uniRequireApiName || '__uniRequireWx'
const regExpUniRequire = new RegExp(`${uniRequireApiName}\\(([a-zA-Z.\\/"'@\\d-_]+)\\)`,'g')
const uniImportWxssApiName = projectToSubPackageConfig.uniImportWxssApiName || `__uniWxss`
const regExpUniImportWxss = new RegExp(`(}|^|\\s|;)${uniImportWxssApiName}\\s*{([^{}]+)}`,'g')
const configWxResourceKey = projectToSubPackageConfig.configWxResourceKey || 'wxResource'
const pluginProcessFileTypes = projectToSubPackageConfig.pluginProcessFileTypes || ['js', 'json', 'wxml', 'ttml', 'ttss', 'swan', 'css', 'html', 'wxss', 'htm', 'wxs', 'sjs', 'acss', 'axml']

let env = 'dev'
if(process.env.NODE_ENV === 'production'){
    env = 'build'
}

const base = 'dist/' + env + `/mp-${program.type}`
let target = 'dist/' + env + `/mp-${program.type}-pack`
if (program.plugin) {
    target = 'dist/' + env + `/mp-${program.type}-pack-plugin`
}
const basePath = path.resolve(cwd, base)
const subModePath = path.resolve(cwd, target, projectToSubPackageConfig.subPackagePath)
const targetPath = path.resolve(cwd, target)
const packIsSubpackage = {
    mode: false
}

module.exports = {
    pluginProcessFileTypes,
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
    packIsSubpackage,
    mpTypeNamespace,
    sourceCodePath
}
