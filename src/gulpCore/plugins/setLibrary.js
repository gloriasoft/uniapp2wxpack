// 解决多个uni解耦目录在同一个项目中时出现异常，问题原因是webpack的队列为全局统一，导致出错，需要做拆队列处理
const {projectToSubPackageConfig, basePath} = require('../preset')
const shortHash = require('shorthash2')
const detectGlobal = require('acorn-globals')
const escodegen = require('escodegen')
let getmac = require('getmac')
if (process.env.BABEL_ENV !== 'rollup') {
    getmac = getmac.default
}
const path = require('path')
const buildHash = shortHash(projectToSubPackageConfig.subPackagePath + getmac() + Math.random() + Date.now())
const defaultOptions = {
    library: `webpackJsonp_${projectToSubPackageConfig.subPackagePath}_${buildHash}`,
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
            if (name !== 'global') continue
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
            return escodegen.generate(ast)
        }
    }
    return content
}
module.exports = setLibrary
