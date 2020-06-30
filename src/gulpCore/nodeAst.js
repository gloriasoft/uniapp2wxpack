const {compile} = require('vue-template-compiler')
class nodeAst {
    constructor (html) {
        this.topNode = {
            children: []
        }
        this.init(html)
        // cleanSpecial(this.topNode, this.documentFragment)
    }
    init (html) {
        this.topNode = compile(`<div>${html}</div>`).ast
    }
    getAttr (child, name) {
        if (!child.attrsMap) return ''
        return child.attrsMap[name] || ''
    }
    setAttr (child, name, value) {
        if (!child.attrsMap) return ''
        child.attrsMap[name] = value
    }
    render (ast = this.topNode.children, prevStr = '') {
        return ast.reduce((prevStr, child) => {
            if (child.removed) return prevStr
            if (child.type === 1 && !child.tag) return prevStr
            if (child.type === 3 || child.type === 2) {
                prevStr += this.writeText(child)
                return prevStr
            }
            const {tag: nodeName, attrsMap, children = []} = child
            prevStr += this.writeOpenTag(nodeName, attrsMap)
            prevStr += this.render(children)
            prevStr += this.writeCloseTag(nodeName)
            return prevStr
        }, prevStr)
    }
    writeOpenTag (nodeName, attrsMap) {
        if (attrsMap) {
            const attrsList = Object.keys(attrsMap).map((key) => {
                if (attrsMap[key].indexOf('"') > -1 && attrsMap[key].indexOf('\'') < 0) {
                    return `${key}='${attrsMap[key]}'`
                }
                return `${key}="${attrsMap[key]}"`
            })
            return `<${nodeName}${attrsList.length > 0 ? ' ' + attrsList.join(' ') : ''}>`
        }
        return `<${nodeName}>`
    }
    writeText (node) {
        return node.text
    }
    writeCloseTag (nodeName) {
        return `</${nodeName}>`
    }
}

module.exports = nodeAst
