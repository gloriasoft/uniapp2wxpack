// 内部自定义插件，混写html
const nodeAst = require('../nodeAst')
const {currentNamespace, mpTypeNamespace} = require('../preset')
const {deepFind} = require('../utils')
const prefixArr = Object.keys(mpTypeNamespace).map((key) => {
    return mpTypeNamespace[key].directivePrefix
})
const htmlArr = Object.keys(mpTypeNamespace).map((key) => {
    return mpTypeNamespace[key].html
})
const prefixRegExp = new RegExp(`^(${prefixArr.join('|')})`)
const htmlRegExp = new RegExp(`\\.(${htmlArr.join('|')})$`, 'i')
function htmlMixinPlugin (content, pathObj) {
    if (pathObj.relative.match(htmlRegExp)) {
        const ast = new nodeAst(content)
        deepFind(ast.topNode, (child) => {
            if (!child.nodeName || child.nodeName === '#text') return

            // 针对头条，过滤wxs
            if (process.env.PACK_TYPE === 'toutiao' && child.nodeName === 'wxs') {
                // 此处不能删除节点，会造成后续循环混乱，转成空文本
                child.nodeName = '#text'
                child.value = ''
                return
            }

            // 过滤include和import和wxs节点引用的文件后缀
            if (child.nodeName.match(/^(include|import|wxs)$/)) {
                if (child.attrs.src) {
                    child.attrs.src = child.attrs.src.replace(htmlRegExp, '.' + currentNamespace.html)
                }
            }

            // 过滤attr
            Object.keys(child.attrs).forEach((key) => {
                if (key.match(prefixRegExp)) {
                    const newKey = key.replace(prefixRegExp, currentNamespace.directivePrefix)
                    child.attrs[newKey] = child.attrs[key]
                    if (newKey !== key) delete child.attrs[key]
                }
            })

        })
        return ast.render()
    }
    return content
}
module.exports = htmlMixinPlugin
