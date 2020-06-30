const nodeAst = require('./src/gulpCore/nodeAst')
const htmlMixins = require('./src/gulpCore/plugins/htmlMixin')
// const {JSDOM} = require('jsdom')
// const ast = new nodeAst(`
// <view class="limt-tips">
//                 {{goodsInfo.activityInfo.activityStatus <= 2 ? '距活动开始' : goodsInfo.activityInfo.activityStatus == 3 ? '距活动结束' : '活动已结束'}}
//               </view>
// `)

const aaa = new nodeAst('<div></div>')
// aaa.childNodes[1]={
//     nodeType:3,
//     rawText:'aaaa',
//     childNodes:[]
// }
// aaa.childNodes[0].attributes.aaa = 'dd'
// aaa.childNodes[0].rawAttrs = 'ccc="a"'
// aaa.topNode.children[0].attrs=[{name:'bbb', value:'444'}]

console.log(aaa)
