/**
 * 处理混写所有端的代码
 * 思路：1.提取全局变量，2.处理不符合的全局变量，3.处理当前端不兼容的方法
 */
const {mpTypeNamespace, currentNamespace} = require('./preset')
// const findGlobalDeps = require('find-global-deps-sourcetype')
const platform = process.env.PACK_TYPE
const globalSet = new Set(Object.keys(mpTypeNamespace).map((key) => {
    return mpTypeNamespace[key].globalObject
}))
function mixinsEnvCode (code) {
    let fakeCode = ''
    // 放弃使用js ast，因为并不能找到所有的全局变量
    // const currentGlobalSet = findGlobalDeps(code, {
    //     environment: ['es6', 'browser'],
    //     sourceType: 'module'
    // })
    globalSet.forEach((key) => {
        if (currentNamespace.globalObject === key) return
        fakeCode += `var ${key} = ${currentNamespace.globalObject};\n`
    })
    return fakeCode
}

module.exports = {
    mixinsEnvCode
}
