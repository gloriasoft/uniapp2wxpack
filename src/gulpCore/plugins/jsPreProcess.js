// 针对原生小程序js的条件编译
const {preprocess} = require('preprocess')
function jsPreProcessPlugin (content, {relative}) {
    if (relative.match(/.js$/i)) {
        try {
            return preprocess(content, process.env, {
                type: 'js'
            })
        } catch (e) {
            console.log('js条件编译出错')
            console.log(e)
            return content
        }
    }
    return content
}

module.exports = jsPreProcessPlugin
