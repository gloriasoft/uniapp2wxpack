// 使用双解析器，因为各有各的缺陷，但是同时使用正好可以处理边界情况
const htmlParser = require("htmlparser2");
const parse5 = require('parse5')
const {deepFind} = require('./utils')
const specialScriptNames = ['wxs','sjs']
const specialScriptRegexp = new RegExp(`^(${specialScriptNames.join('|')})$`, 'i')
function cleanSpecial (astTree, documentFragmentTree) {
    // 从astTree中删除wxs
    deepFind(astTree, (child) => {
        if (child.nodeName && child.nodeName.match(specialScriptRegexp)) {
            // 此处不能删除节点，会造成后续循环混乱，转成空文本
            child.nodeName = '#text'
            child.childNodes = []
            child.value = ''
        }
    })

    // 找出正常的wxs片段
    deepFind(documentFragmentTree, (child) => {
        if (child.nodeName && child.nodeName.match(specialScriptRegexp)) {
            const {nodeName, attrs, childNodes} = child
            const newAttrs = {}
            attrs.forEach((attr) => {
                newAttrs[attr.name] = attr.value
            })
            const newNode = {
                nodeName,
                attrs: newAttrs,
                parentNode: astTree
            }
            if (childNodes[0] != null && childNodes[0].nodeName === '#text') {
                newNode.childNodes = [{
                    nodeName: '#text',
                    value: childNodes[0].value,
                    parentNode: newNode
                }]
            }
            astTree.childNodes.unshift(newNode)
        }
    })
}
class nodeAst {
    constructor (html) {
        this.topNode = {
            childNodes: []
        }
        this.currentNode = this.topNode
        this.documentFragment = parse5.parseFragment(html)
        this.init(html)
        cleanSpecial(this.topNode, this.documentFragment)
    }
    init (html) {
        const parser = new htmlParser.Parser({
            onopentag: (nodeName, attrs) => {
                const node = {
                    nodeName,
                    attrs,
                    childNodes: []
                }
                this.appendElement(node)
            },
            ontext: (value) => {
                const node = {
                    nodeName: '#text',
                    value
                }
                this.appendText(node)
            },
            onclosetag: (name) => {
                this.closeElement()
            }
        }, {
            decodeEntities: false,
            xmlMode: true
        })
        parser.write(html)
        parser.end()
    }
    appendElement (node) {
        node.parentNode = this.currentNode
        this.currentNode.childNodes.push(node)
        this.currentNode = node
    }
    appendText (node) {
        node.parentNode = this.currentNode
        this.currentNode.childNodes.push(node)
    }
    closeElement () {
        this.currentNode = this.currentNode.parentNode || this.currentNode
    }
    render (ast = this.topNode.childNodes, prevStr = '') {
        return ast.reduce((prevStr, child) => {
            if (child.removed) return prevStr
            if (child.nodeName === '#text') {
                prevStr += this.writeText(child)
                return prevStr
            }
            const {nodeName, attrs, childNodes} = child
            prevStr += this.writeOpenTag(nodeName, attrs)
            prevStr += this.render(childNodes)
            prevStr += this.writeCloseTag(nodeName)
            return prevStr
        }, prevStr)
    }
    writeOpenTag (nodeName, attrs) {
        attrs = Object.keys(attrs).map((key) => {
            return `${key}="${attrs[key]}"`
        })
        return `<${nodeName}${attrs.length > 0 ? ' ' + attrs.join(' ') : ''}>`
    }
    writeText (node) {
        return node.value
    }
    writeCloseTag (nodeName) {
        return `</${nodeName}>`
    }
}

module.exports = nodeAst
