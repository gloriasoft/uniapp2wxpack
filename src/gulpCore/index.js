/*
* 作者devilwjp（天堂里的花大咩）
* 2019年7月
* 解决的问题：一切不能输出解耦包的小程序开发框架，都是耍流氓！
* 思路：在uni-app打包完之后，再进行一次打包，再次打包不可使用webpack，使用gulp进行文件流级别的处理，解除uni对于app.js的依赖，以及解除对Page和Component的劫持
* 由于是解耦包，所以不会在app.js中留存任何uni的痕迹，可做到整个uni项目不依赖于主包运行
*
* 对uni-app在微信小程序的打包方案进行改造，形成解耦打包，并且支持微信原生页面直接在uni-app项目中使用
* 1.可以使项目输出微信小程序的分包，被其他小程序项目使用
* 2.支持微信原生页面直接在uni-app项目中使用（还支持任何原生的js、wxss在uni-app项目中使用）
* 3.支持原生小程序项目直接在uni-app项目中进行开发，当uni-app的解耦包是主包时，uni-app包可以通过globalData进行方法公开，被原生小程序的其他页面和分包使用
* 4.支持uni-app项目调用原生小程序项目中的资源
* 5.支持开发微信小程序插件模式
*
* */

// 忽略异步错误
process.on('unhandledRejection', () => {
    return
});

// 删除uni的原始dist/mp-weixin目录下所有文件
require('./tasks/clean_base')
// 删除dist/mp-weixin-pack下的解耦包目录所有文件
require('./tasks/clean_subModePath')
// 删除dist/mp-weixin-pack
require('./tasks/clean_previewDist')
// 监听pluginJson
require('./tasks/watch_pluginJson')
// 监听project.config.json
require('./tasks/watch_projectConfigJson')
// 监听pages.json
require('./tasks/watch_pagesJson')
// 监听dist/mp-weixin/app.json
require('./tasks/watch_baseAppJson')
// 监听主原生小程序的app.json
require('./tasks/watch_mainAppJson')
// 极端混合模式下的特殊监听处理
require('./tasks/watch_topMode-mainAppJsAndAppWxss')
// 监听主原生小程序的同解耦包目录名相同的目录
require('./tasks/watch_mainWeixinMpPackPath')
// 监听主原生小程序
require('./tasks/watch_mainWeixinMp')
// 解耦构建
require('./tasks/subMode_createUniSubPackage')
// 解耦构建处理wxresource目录
require('./tasks/subMode_copyWxResource')
// 主调度任务
require('./tasks/mpWxSubMode')
// 开发启动任务
require('./tasks/startToPackServe')
