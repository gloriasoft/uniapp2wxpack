// 修改webpack依赖队列的对象名，用于避免与其他webpack打包的项目混合时可能产生的加载冲突
// 此插件可代替webpack的library配置
const {projectToSubPackageConfig: {subPackagePath}, basePath, currentNamespace: {webpackGlobal}} = require('../preset')
const shortHash = require('shorthash2')
const detectGlobal = require('acorn-globals')
const escodegen = require('escodegen')
let getmac = require('getmac')
if (process.env.BABEL_ENV !== 'rollup') {
    getmac = getmac.default
}
const path = require('path')
const buildHash = shortHash(subPackagePath + getmac() + Math.random() + Date.now())
const defaultOptions = {
    library: `webpackJsonp_${subPackagePath}_${buildHash}`,
    reference: 'webpackJsonp'
}
function setLibrary (content, {fromAbsolute}, defaultPluginMap, options = {}) {
    options = {
        ...defaultOptions,
        ...options
    }
    let updated = false
    // 判断来自于uni-app编译目录的js文件
    if (fromAbsolute.startsWith(basePath) && path.extname(fromAbsolute) === '.js') {
        // 获取js中所有的全局变量
        const ast = detectGlobal.parse(content)
        const scope = detectGlobal(ast)
        for (const {name, nodes} of scope) {
            if (name !== webpackGlobal) continue
            for (const {parents} of nodes) {
                for (const parent of parents) {
                    const {type, property: {type: propType, value: propValue} = {}} = parent
                    // 判断是否替换对象
                    if (type === 'MemberExpression' && propType === 'Literal' && propValue === options.reference) {
                        // 修改library
                        parent.property.value = options.library
                        updated = true
                    }
                }
            }
        }
        if (updated) {
            const format = process.env.NODE_ENV === 'production' ? escodegen.FORMAT_MINIFY: escodegen.FORMAT_DEFAULTS
            return escodegen.generate(ast, {format})
        }
    }
    return content
}
module.exports = setLibrary
