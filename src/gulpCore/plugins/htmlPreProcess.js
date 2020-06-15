// 针对原生小程序css的条件编译
const {currentNamespace} = require('../preset')
const {preprocess} = require('preprocess')
function htmlPreProcessPlugin (content, {relative}) {
    if (relative.match(new RegExp(`.${currentNamespace.html}$`, 'i'))) {
        try {
            return preprocess(content, process.env, {
                type: 'html'
            })
        } catch (e) {
            console.log(`${currentNamespace.html}条件编译出错`)
            console.log(e)
            return content
        }
    }
    return content
}

module.exports = htmlPreProcessPlugin
