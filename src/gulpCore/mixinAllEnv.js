/**
 * 处理混写所有端的代码
 * 思路：1.提取全局变量，2.处理不符合的全局变量，3.处理当前端不兼容的方法
 */
const {mpTypeNamespace} = require('./preset')
const findGlobalDeps = require('find-global-deps-sourcetype')
const platform = process.env.PACK_TYPE
const globalSet = new Set(Object.keys(mpTypeNamespace).map((key) => {
    return mpTypeNamespace[key].globalObject
}))
function mixinsEnvCode (code) {
    let fakeCode = ''
    const currentGlobalSet = findGlobalDeps(code, {
        environment: ['es6', 'browser'],
        sourceType: 'module'
    })
    currentGlobalSet.forEach((key) => {
        if (mpTypeNamespace[platform].globalObject === key) return
        if (globalSet.has(key)) {
            fakeCode += `var ${key} = ${mpTypeNamespace[platform].globalObject};\n`
        }
    })
    return fakeCode
}

module.exports = {
    mixinsEnvCode
}
