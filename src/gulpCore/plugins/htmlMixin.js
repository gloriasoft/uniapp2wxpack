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
        const ast= new nodeAst(content)
        deepFind(ast.topNode, (child) => {
            if (!child.tag || child.type === 3) return

            // 针对头条，过滤wxs
            // if (process.env.PACK_TYPE === 'toutiao' && child.tag === 'wxs') {
            //     // 此处不能删除节点，会造成后续循环混乱，转成空文本
            //     child.tag = ''
            //     return
            // }

            // 针对头条，class属性不能是非字符串，但是可以通过加一个空格解决这个问题
            const className = ast.getAttr(child, 'class')
            if (process.env.PACK_TYPE === 'toutiao' && className && !className.match(/(^\s|(\s$))/)) {
                ast.setAttr(child, 'class', className + ' ')
            }

            // 针对头条，头条没有catchTap，转换成bindTap
            const catchTap = ast.getAttr(child, 'catchTap')
            if (process.env.PACK_TYPE === 'toutiao' && catchTap && !ast.getAttr(child, 'bindTap')) {
                ast.setAttr(child, 'bindTap', catchTap)
            }

            // 过滤include和import和wxs节点引用的文件后缀
            const src = ast.getAttr(child, 'src')
            if (child.tag.match(/^(include|import)$/)) {
                if (src) {
                    ast.setAttr(child, 'src', src.replace(htmlRegExp, '.' + currentNamespace.html))
                }
            }

            // 过滤attr
            if (!child.attrsMap) return
            Object.keys(child.attrsMap).forEach((key) => {
                if (key.match(prefixRegExp)) {
                    const newKey = key.replace(prefixRegExp, currentNamespace.directivePrefix)
                    child.attrsMap[newKey] = child.attrsMap[key]
                    if (newKey !== key) delete child.attrsMap[key]
                }
            })
        })
        return ast.render()
    }
    return content
}
module.exports = htmlMixinPlugin
