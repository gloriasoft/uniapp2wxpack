const fs = require('fs-extra')
const path = require('path')
const parse5 = require('parse5')
const nodeAst = require('./src/gulpCore/nodeAst')
const content = fs.readFileSync(path.resolve(__dirname, './index.wxml'), 'utf8')
const {deepFind} = require('./src/gulpCore/utils')
const ast = new nodeAst(content)
console.log(ast.render())
// console.log(parse5.parseFragment(content))
// const ast = new nodeAst(content)
// const mpTypeNamespace = {
//     weixin: {
//         html: 'wxml',
//         css: 'wxss',
//         globalObject: 'wx',
//         mainMpPath: 'mainWeixinMpPath',
//         directivePrefix: 'wx:'
//     },
//     baidu: {
//         html: 'swan',
//         css: 'css',
//         globalObject: 'swan',
//         mainMpPath: 'mainBaiduMpPath',
//         directivePrefix: 's-'
//     },
//     toutiao: {
//         html: 'ttml',
//         css: 'ttss',
//         globalObject: 'tt',
//         mainMpPath: 'mainToutiaoMpPath',
//         directivePrefix: 'tt:'
//     }
// }
// const currentNamespace = mpTypeNamespace['weixin']
// const prefixArr = Object.keys(mpTypeNamespace).map((key) => {
//     return mpTypeNamespace[key].directivePrefix
// })
// const htmlArr = Object.keys(mpTypeNamespace).map((key) => {
//     return mpTypeNamespace[key].html
// })
// const prefixRegExp = new RegExp(`^(${prefixArr.join('|')})`)
// const htmlRegExp = new RegExp(`\\.(${htmlArr.join('|')})$`, 'i')
// deepFind(ast.topNode, (child) => {
//     if (!child.nodeName || child.nodeName === '#text') return
//
//     // 针对头条，过滤wxs
//     if (process.env.PACK_TYPE === 'toutiao' && child.nodeName === 'wxs') {
//         // 此处不能删除节点，会造成后续循环混乱，转成空文本
//         child.nodeName = '#text'
//         child.value = ''
//         return
//     }
//
//     // 过滤include和import和wxs节点引用的文件后缀
//     if (child.nodeName.match(/^(include|import|wxs)$/)) {
//         if (child.attrs.src) {
//             child.attrs.src = child.attrs.src.replace(htmlRegExp, '.' + currentNamespace.html)
//         }
//     }
//
//     // 过滤attr
//     Object.keys(child.attrs).forEach((key) => {
//         if (key.match(prefixRegExp)) {
//             const newKey = key.replace(prefixRegExp, currentNamespace.directivePrefix)
//             child.attrs[newKey] = child.attrs[key]
//             if (newKey !== key) delete child.attrs[key]
//         }
//     })
//
// })
// console.log(ast.render())
// console.log(ast.topNode.childNodes[2].childNodes[1])
