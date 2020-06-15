// 针对原生小程序css的条件编译
const {currentNamespace} = require('../preset')
const {preprocess} = require('preprocess')
function cssPreProcessPlugin (content, {relative}) {
    if (relative.match(new RegExp(`.${currentNamespace.css}$`, 'i'))) {
        try {
            return preprocess(content, process.env, {
                type: 'css'
            })
        } catch (e) {
            console.log(`${currentNamespace.css}条件编译出错`)
            console.log(e)
            return content
        }
    }
    return content
}

module.exports = cssPreProcessPlugin
