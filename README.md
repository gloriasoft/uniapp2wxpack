# uniapp2wxpack   
  
问题反馈QQ群:701697982 <a target="_blank" href="https://jq.qq.com/?_wv=1027&k=2DjrpVZL" rel="nofollow"><img src="http://pub.idqqimg.com/wpa/images/group.png" alt="uniapp2wxpack问题反馈群"></a>  
  
## Uni-App的小程序混合开发（解耦构建）插件  
+ 原生开发的小程序仍保留，部分新功能使用uni-app开发  
+ uni-app开发的小程序项目整个作为一个目录集成到其他原生开发的小程序中（或者任何框架开发最终构建成的原生小程序）  
+ 使用uni-app开发微信小程序插件  
+ 可以在此基础上，使用plugin功能编写自己的CI/CD脚本  
+ 原生小程序混写

## 示例项目  
#### [点击进入微信小程序混合开发项目示例](https://github.com/devilwjp/uni-project-to-subpackage)  
#### [点击进入头条小程序混合开发项目示例](https://github.com/devilwjp/uni-project-to-ttpack)  
#### [点击进入支付宝小程序混合开发项目示例](https://github.com/devilwjp/uni-project-to-alipayPack)  
#### [点击进入百度小程序混合开发项目示例](https://github.com/devilwjp/uni-subpackage-swan-demo)  
#### [点击进入使用uni-app开发微信小程序插件的示例](https://github.com/devilwjp/uni-project-to-plugin)  

## 前方高能！文档很长请耐心读完！！！  

## 快速上手  
#### 第一步  
准备一个uni-app项目（**需要使用vue-cli安装的uni-app项目，因为hbuildx安装的项目没有相关依赖和src目录，进入uni-app官网查找使用vue-cli安装方式**）  
  
#### 第二步  
在项目根目录，安装`uniapp2wxpack`  
````  
npx uniapp2wxpack --create
````  
  
#### 第三步 
第二步完成之后，项目根目录下会自动创建`projectToSubPackageConfig.js`，可按需进行配置  
  
#### 第四步  
`package.json`文件中会自动添加以下命令  
````  
// 微信小程序开发
npm run dev:mp-weixin-pack
// 头条小程序开发
npm run dev:mp-toutiao-pack
// 支付宝小程序开发
npm run dev:mp-alipay-pack
// 百度小程序开发
npm run dev:mp-baidu-pack

// 微信小程序打包（生产环境）
npm run build:mp-weixin-pack
// 头条小程序打包（生产环境）
npm run build:mp-toutiao-pack
// 支付宝小程序打包（生产环境）
npm run build:mp-alipay-pack
// 百度小程序打包（生产环境）
npm run build:mp-baidu-pack
````  
  
#### 第五步  
用小程序开发者工具预览`dist/dev/mp-weixin-pack`目录（开发环境）  
用小程序开发者工具预览`dist/build/mp-weixin-pack`目录（生产环境）  

#### 第六步，观察效果  
uni-app项目的内容被打包成了一个目录混合进了原生小程序项目中  
  
### 安装之后
+ 会在项目中创建`projectToSubPackageConfig.js`  
+ 会创建`mainWeixinMp`目录（可根据`projectToSubPackageConfig.js`的配置修改目录名）  


### 升级之后的项目结构  
与普通uni-app项目的结构保持一致  
``````
│  babel.config.js  
│  package-lock.json 
│  package.json 
│  postcss.config.js
│  projectToSubPackageConfig.js             // 解耦包配置文件
│  README.md
├─dist
│  └─dev
│      ├─mp-weixin                          // uni-app微信小程序普通构建目录
│      └─mp-weixin-pack                     // uni-app微信小程序解耦构建目录（用于预览）
├─mainWeixinMp                              // 原生主小程序目录
├─public  
└─src                                       // uni-app源码目录
    │  App.vue
    │  LICENSE
    │  main.js
    │  manifest.json
    │  package.json
    │  pages.json
    │  README.md
    │  template.h5.html
    │  uni.scss
    │  
    ├─pages       
    ├─static
    ├─store
    ├─wxcomponents
    └─wxresource                            // 原生页面及资源存放目录
``````   
### 一些重要的概念 
+ uni-app项目目录   
   `src`  
+ 原生小程序项目（原生）目录  
   `mainWeixinMp`   (可根据不同的平台单独进行配置修改)  
+ uni-app项目中的原生小程序页面（或资源）目录（可缺省）  
   `src/wxresource`（头条是`src/ttresource`,支付宝是`src/myresource`,百度是`src/swanresource`，也可设置成同一个）   
+ uni-app项目打包输出之后在主小程序（原生）项目中的目录  
   `uniSubpackage` (可进行配置修改)  
+ **uniapp2wxpack的配置文件**  
   `projectToSubPackageConfig.js`  
+ 路径问题  
   由于将uni-app项目打包成了目录，所以原先项目中使用的绝对路径会出现路径指向错误，此问题经常会表现在图片和跳转路径上，（pages.json中的页面和分包路径无需要处理，插件会自行处理），其他需要开发者进行修正，或者使用`高级配置`  

## 分包场景  
### 将整个uni项目作为原生小程序的分包  
在`mainWeixinMp/app.json`中，将`uniSubpackage`设置为分包目录  
**注意：`subPackages`里的`pages`设为空数组**   
此时，无论uni-app项目中的`pages.json`如何设置，整个uni-app项目都会变成原生小程序项目的一个分包  
````javascript
// app.json中的subpackages
{
  "subPackages":[{
    "root":"uniSubpackage",
    "pages":[]
  }]
}
````  
### 在uni项目中的vue页面分包    
````javascript
// pages.json
{
	// indexPage配置后，会提升为整个小程序项目的首页
	"indexPage":"",
	"pages": [
		{
			"path": "pages/test/about",
			"style": {
				"navigationBarTitleText": "测试"
			}
		}
	],
	"subPackages":[{
		"root": "pages/about",
		"pages": [{
			"path": "about",
			"style": {
				"navigationBarTitleText": "测试"
			}
		}]
	}],
	// uni项目中直接使用原生页面（src/wxresource/pages/test/index）
	// 由于wxresourece目录是个虚拟目录，所以路径中要去掉
	"wxResource":{
		"pages":["pages/test/index"]
	}
}
````  
### 在wxresource中使用分包  
````javascript
// pages.json
{
	// indexPage配置后，会提升为整个小程序项目的首页
	"indexPage":"",
	"pages": [
		{
			"path": "pages/about/about",
			"style": {
				"navigationBarTitleText": "测试"
			}
		}
	],
	"wxResource":{
		"subPackages":[{
			"root": "pages/test",
			"pages": ["index"]
		}]
	}
}
````  
### uni项目中vue页面和wxresouce页面，在构建后同时在一个目录里，设置分包  
虽然设置在了不同的地方，但是构建后会合并到一起
````javascript
// pages.json
{
	// indexPage配置后，会提升为整个小程序项目的首页
	"indexPage":"",
	"pages": [
		{
			"path": "pages/about/about",
			"style": {
				"navigationBarTitleText": "测试"
			}
		}
	],
	// 构建后的目录uniSubpackage/pages/test
	"subPackages":[{
		"root": "pages/test",
		"pages": [{
			"path": "about",
			"style": {
				"navigationBarTitleText": "测试"
			}
		}]
	}],
	// 构建后的目录uniSubpackage/pages/test
	"wxResource":{
		"subPackages":[{
			"root": "pages/test",
			"pages": ["index"]
		}]
	}
}
````  
## 混合方式  
### 普通混合  
默认混合方式，会将uni-app项目打包成一个目录，植入进原生小程序项目的根目录中  
此方式对于uni-app项目的`app.vue`中的生命周期与原生小程序的`app.js`中的生命周期混合有三种处理方式，在`projectToSubPackageConfig.js`中对`appMode`进行设置（详见`appMode`设置）  
### 极端混合  
将完整的微信原生小程序项目，保证目录结构不变的情况下混合（merge）到uni-app项目中，使uni-app项目的目录结构与原生项目的目录结构保持一致（不单独区分`uniSubpackage`目录）  
  
规则：  
1. 当原生文件路径与uni打包后的文件路径冲突时，以uni打包后的文件为优先  
2. 根目录的`app.js`和`app.wxss`以原生项目的文件路径为优先，并且会做特殊的混合处理，将uni打包后的`app.js`和`app.wxs`s`与原生的文件混合  
#### 配置极端方式迁移  
仅需要配置`projectToSubPackageConfig.js`即可，并且项目中的`pack.config.js`的`packPath`属性也会自动变成空字符  
```javascript
// projectToSubPackageConfig.js
module.exports={
    // 微信原生小程序目录
    mainWeixinMpPath: 'mainWeixinMp',
    // uni项目输出的分包在微信原生小程序中的路径
    subPackagePath: '',
    // uni项目的App.vue中初始设置的处理方式，默认是relegation(降级模式)，[top(顶级模式) / none(丢弃)]
    appMode: 'top',
    // 如果微信原生小程序目录中的目录名称合uni项目输出的目录名相同，是否融合处理，默认不融合处理，直接忽略原生小程序里的目录，merge以uni项目优先
    mergePack: true
}
```
这样原生小程序就完整的迁移成了uni-app项目  
## projectToSubPackageConfig.js  
解耦构建配置文件  
````javascript
module.exports={
    // 微信原生小程序目录
    mainWeixinMpPath: 'mainWeixinMp',
    // 头条原生小程序目录
    mainToutiaoMpPath: 'mainToutiaoMp',
    // 支付宝原生小程序目录
    mainAlipayMpPath: 'mainAlipayMp',
    // 百度原生小程序
    mainBaiduMpPath: 'mainBaiduMp',
    // uni项目输出的分包在原生小程序中的路径
    subPackagePath: 'uniSubpackage',
    // project.config.json存放的目录，默认为null，会从原生小程序根目录查找，如果没有找整个项目根目录
    projectConfigPath: null,
    // uni项目的App.vue中初始设置的处理方式，默认是relegation(降级模式)，[top(顶级模式) / none(丢弃)]
    // 如果ide不支持relegation，插件会转为top或者none，会在ide中发起警告提示
    appMode: 'relegation',
    // 如果原生小程序目录中的目录名称合uni项目输出的目录名相同，是否融合处理，默认不融合处理，直接忽略原生小程序里的目录，merge以uni项目优先
    mergePack: false,
    // uni-app项目的源码目录
    sourceCodePath: 'src',
    /**
     * uni项目中的原生资源目录路径,null代表使用默认值
     * process.env.PACK_TYPE = weixin 默认值为 'src/wxresource'
     * process.env.PACK_TYPE = toutiao 默认值为 'src/ttresource'
     * 也可以自行设定，通过环境变量process.env.PACK_TYPE进行动态设置
     */
    wxResourcePath: null,
    // 原生资源目录路径别名, null代表使用默认值，默认值为 @wxResource (所有类型小程序通用)
    wxResourceAlias: null,
    // 引用原生资源的js的特殊API名称设定, null代表使用默认值，默认值为 __uniRequireWx (所有类型小程序通用)
    uniRequireApiName: null,
    // 引用原生资源的样式文件的特殊API名称设定, null代表使用默认值，默认值为 __uniWxss (所有类型小程序通用)
    uniImportWxssApiName: null,
    // uni项目中的原生资源在pages.json中的特殊属性名称，null代表使用默认值，默认值为 wxResource (所有类型小程序通用)
    configWxResourceKey: null,
    // 插件
    plugins: [
        // 条件编译插件应该在混写插件之前使用
        'jsPreProcessPlugin', // js条件编译
        'cssPreProcessPlugin', // css条件编译
        'htmlPreProcessPlugin', // html条件编译
    ]
}  
````  
## wxresource目录  
头条是`ttresource`,支付宝是`myresource`,百度是`swanresource`，也可以都配置成同一个    
uni-app源码中要使用的原生页面及资源存放的目录（并非原生小程序目录）  
`wxresource`目录中的页面都必须配置在`pages.json`的`wxResource`属性里  
**注意：wxresource目录构建后所在的物理路径，实际上就是src目录所在的路径，也就是uni包目录本身，所以构建后，wxresource中的文件和目录将被移动至uniSubpackage下，如果内容中有目录于src相同，则将会融合，目录名文件名都相同则将被丢弃**  
## appMode  
由于uni项目的`App.vue`对应小程序的`app.js`，在解耦包的模式中，会对主小程序的`app.js`产生冲突。  
所以设置了三种模式对`App.vue`进行处理，可以在`projectToSubPackageConfig.js`设置  
    
+ relegation (降级模式，默认)  
降级模式的含义是将uni目录从项目级别降级到了目录级别，那么`App.vue`中的钩子函数就只对目录有效  
比如：`App.vue`中的`onLaunch`，会降级成首次进入uni目录才触发，同样的，`onHide`会降级成只要离开uni目录的范围就会触发  
  
+ top (顶级模式)  
顶级模式的含义就是把uni的`App.vue`中的钩子和主小程序的`app.js`的钩子混合在一起  
**注意：顶级模式中uni包不能以分包形式存在，只能以主包的子目录形式存在（否则无法确保onLaunch的准确性），需要确保主小程序的app.js中引入了uni项目的app.js(自有项目会自动添加引入，如果是把构建解耦包提供给其他项目，需要其他项目的根目录下的app.js手动引入)**  
**如果不需要在根app.js中依赖uni包的方法和属性，可以不引用uni包的app.js，uni包依旧可以准确的触发onLauch和onShow**  
  
+ none (丢弃模式)  
丢弃模式就是不处理`App.vue`中的钩子  
  
降级模式和顶级模式都会将`globalData`和`getApp()`返回的内容进行混合  
所有模式都会将App.vue的初始设置保存在`wx.__uniapp2wxpack.uniSubpackage.__packInit`中（`uniSubpackage`属性是和uni的目录名保持一致的，如果修改目录名，属性名也会变更）  

**注意：如果要手动通过wx.__uniapp2wxpack触发App的钩子，需要首先确保触发onLaunch，否则App的onShow和onHide不会有效**  
## API  
+ wx.__uniapp2wxpack  
用于存放解耦包相关方法和数据的对象，在引入解耦包的`app.js`后，通过获取`wx.__uniapp2wxpack.uniSubpackage.__packInit`，可以拿到uni项目`App.vue`的初始化配置  
**注意：其中uniSubpackage属性代表了解耦包的名称，名称变化，该属性也会相应的改变**
  
+ __uniRequireWx (所有小程序也通用)  
只支持静态字符串参数  
在uni-app项目的源码目录中的vue、js文件需要引入原生的微信小程序资源（除了uni-app自带的`wxcomponents`目录外）都需要使用`__uniRequireWx`方法(类似node的require)，并且往往会配合目录别名`@wxResource`
````javascript
const nativeResource = __uniRequireWx('@wxResource/nativeJs/test')
const nativeExportDefaultObject = __uniRequireWx('@wxResource/nativeJs/test1').defaut
const {nativeRestObject} =  __uniRequireWx('@wxResource/nativeJs/test')
````  
如果在typescript项目中，建议在项目的main.ts文件中声明`__uniRequireWx`为全局变量，例如：  
```typescript
declare global {
    const __uniRequireWx: any;
}
```

+ __uniWxss (所有小程序也通用)  
只支持静态字符串参数  
在uni-app项目的源码目录中的vue、scss、less文件中引入原生的微信小程序wxss、ttss资源(类似`@import 'xxxxxx'`),往往会配合目录别名`@wxResource`  
````css
__uniWxss {
    import: '@wxResource/nativeWxss/1.wxss';
    import: '@wxResource/nativeWxss/2.wxss';
    import: '@wxResource/nativeWxss/3.wxss';
}
__uniWxss {
    import: '@wxResource/nativeWxss/1.ttss';
    import: '@wxResource/nativeWxss/2.ttss';
    import: '@wxResource/nativeWxss/3.ttss';
}
````  
### @wxResource (所有小程序也通用)  
特殊的目录别名，此别名同时指向2个资源  
`@wxResource`只能在`__uniRequireWx`和`__uniWxss`中使用  
+ 指向`src/wxresource`(头条是`src/ttresource`,支付宝是`src/myresource`,百度是`src/swanresource`，也可以配置成统一)  
+ 指向构建后的原生小程序项目中的uni解耦包目录  
#### 意味着src/wxresource(头条是ttresource,支付宝是myresource,百度是swanresource)会和uni解耦包融合(merge)构建  
````javascript  
// 跳出uni解耦包的目录，访问上层资源
__uniRequireWx('../@wxResource/top/1.js')
__uniRequireWx('@wxResource/../top/1.js')

// 绝对路径访问(访问原生小程序的根目录下的top/1.js)
__uniRequireWx('/top/1.js')
````  
## pack.config.js  
在通过`uniapp2wxpack`构建完成的小程序项目中的uni解耦包目录下会存在`pack.config.js`，这个文件仅仅是保存了uni解耦包在最终小程序中的目录名，以便uni项目中使用动态路径（非相对路径）跳转页面或者加载图片地址  
注意：`pack.config.js`的`packPath`中保存的是绝对路径  
````javascript
// 使用pack.config.js中的packPath作为跳转uni项目页面的前缀
// 这样可以确保无论那种混合方式或者任意的uni解耦包命名，都能正确的跳转uni的页面
const { packPath } = __uniRequireWx('@wxResource/pack.config.js')
uni.navigateTo({
    url: packPath + '/pages/about'
})
````  
## 混写  
从3.2.0版本开始支持混写功能，无论是原生小程序文件还是uni-app的文件都可以直接使用某一端的全局对象和相关html和css的自有文件，插件会统一转换成目标端的规范。在`projectToSubPackageConfig.js`中，可以将各不同端的原生资源目录设置成同一个，放心的交给插件来处理，可能会有一些特殊段api不兼容的情况，在原生代码中可以通过条件编译来做一些不同平台的条件判断。  
**(系统默认全局对个小程序平台文件后缀名进行混写，其他更多的混写需要在插件中配置)**  
  
例如，我们将微信原生目录(`mainWeixinMpPath`)和头条原生目录(`mainToutiaoMpPath`)设置成同一个`allNativeMp`，将原生原生资源和头条原生资源的对应动态目录(`wxResourcePath`)也设置成一个常量`src/allresource`，可以任意混写不同端的代码。最后配置插件，开启更高级的混写，混写只能对不是太复杂的页面进行处理，复杂业务的页面混写处理后可能还是有有问题，需要手动通过条件编译进行修复  
```javascript
// projectToSubPackageConfig.js
module.exports={
    // 微信原生小程序目录
    mainWeixinMpPath: 'allNativeMp',
    // 头条原生小程序目录
    mainToutiaoMpPath: 'allNativeMp',
    // uni项目输出的分包在原生小程序中的路径
    subPackagePath: 'uniSubpackage',
    // uni项目的App.vue中初始设置的处理方式，默认是relegation(降级模式)，[top(顶级模式) / none(丢弃)]
    appMode: 'relegation',
    // 如果原生小程序目录中的目录名称合uni项目输出的目录名相同，是否融合处理，默认不融合处理，直接忽略原生小程序里的目录，merge以uni项目优先
    mergePack: false,
    /**
     * uni项目中的原生资源目录路径,null代表使用默认值
     * process.env.PACK_TYPE = weixin 默认值为 'src/wxresource'
     * process.env.PACK_TYPE = toutiao 默认值为 'src/ttresource'
     * 也可以自行设定，通过环境变量process.env.PACK_TYPE进行动态设置
     */
    wxResourcePath: 'src/allresource',
    // 原生资源目录路径别名, null代表使用默认值，默认值为 @wxResource (所有类型小程序通用)
    wxResourceAlias: null,
    // 引用原生资源的js的特殊API名称设定, null代表使用默认值，默认值为 __uniRequireWx (所有类型小程序通用)
    uniRequireApiName: null,
    // 引用原生资源的样式文件的特殊API名称设定, null代表使用默认值，默认值为 __uniWxss (所有类型小程序通用)
    uniImportWxssApiName: null,
    // uni项目中的原生资源在pages.json中的特殊属性名称，null代表使用默认值，默认值为 wxResource (所有类型小程序通用)
    configWxResourceKey: null,
    plugins: [
        // 条件编译插件应该在混写插件之前使用
        'jsPreProcessPlugin', // js条件编译
        'cssPreProcessPlugin', // css条件编译
        'htmlPreProcessPlugin', // html条件编译
        'jsMixinPlugin', // js混写
        'polyfillPlugin', // 对一些js方法的polyfill
        'htmlMixinPlugin', // html混写
        'cssMixinPlugin' // css混写
    ]
}
```  
比如在uni-app某各页面vue文件  
```vue
<template>
    <view>teat</view>
</template>
<script>
export default {
    methods: {
        jump () {
            // 使用了微信小程序的原生对象
            wx.navigateTo({
                url: '/pages/test/test'
            })
        }
    }
}
</script>
<style>
/*引入原生头条小程序的ttss*/
__uniWxss{
    import: '@wxResource/nativeCommon/test.ttss';
    import: '@wxResource/nativeCommon/test1.ttss';
}
</style>
```  
**并且原生资源中又有许多其他不同端的小程序页面和样式文件**  
**最后发布生成头条或者微信小程序时，插件都会处理成不同端需要的对象和文件名**  
这里需要注意的是，现在的混写只是处理各端全局对象(比如`wx,swan,tt`等)和文件名(比如`wxml、wxss、ttml、ttss、swan、css`等)，如果遇到是各端api和组件的差异，仍然需要开发者自行处理，开发者可以在自定义plugin中进行中心化的处理，也可以在项目代码中直接通过区分不同端来处理  
## 系统plugin  
从3.2.0版本开始支持`plugin`，设置`projectToSubPackageConfig.js`, 现在支持7个系统插件  
插件处理的文件路径是经过打包后的路径，就是在`dist`目录中各环境各端的pack目录中的物理路径  
```javascript
module.exports = {
    plugins: [
         // 条件编译插件应该在混写插件之前使用
         'jsPreProcessPlugin', // js条件编译
         'cssPreProcessPlugin', // css条件编译
         'htmlPreProcessPlugin', // html条件编译
         'jsMixinPlugin', // js混写
         'polyfillPlugin', // 对一些js方法的polyfill
         'htmlMixinPlugin', // html混写
         'cssMixinPlugin' // css混写
    ]
}
```  
## 条件编译  
从3.2.1开始，提供了3个支持原生小程序代码的条件编译系统插件, 通过判断`PACK_TYPE`可以进行平台的条件判断，也可以在启动命令中加入自定义的环境变量进行判断（一切在`uniapp2wxpack`进程中的`process.env`对象中的环境变量都能被用于判断）  
原生小程序条件编译的语法与uni-app的条件编译略有差异  
### jsPreProcessPlugin  
js的条件编译插件  
```javascript
// @if PACK_TYPE='weixin'
console.log('only weixin')
// @endif

// @if PACK_TYPE!='baidu'
console.log('exclude baidu')
// @endif

// @if PACK_TYPE='weixin' || PACK_TYPE='baidu'
console.log('weixin or baidu')
// @endif

// @if PACK_TYPE='weixin' && NODE_ENV='development'
console.log('weixin and development')
// @endif
```  
### cssPreProcessPlugin  
css的条件编译插件  
```css
/* @if PACK_TYPE='weixin' */
.test{
    color: red;
}
/* @endif */

/* @if PACK_TYPE!='baidu' */
.test{
    color: red;
}
/* @endif */

/* @if PACK_TYPE='weixin' || PACK_TYPE='baidu' */
.test{
    color: red;
}
/* @endif */

/* @if PACK_TYPE='weixin' && NODE_ENV='development' */
.test{
    color: red;
}
/* @endif */
```  
### htmlPreProcessPlugin  
html的条件编译插件  
```html
<!-- @if PACK_TYPE='weixin' -->
<view>only weixin</view>
<!-- @endif -->

<!-- @if PACK_TYPE!='baidu' -->
<view>exclude baidu</view>
<!-- @endif -->

<!-- @if PACK_TYPE='weixin' || PACK_TYPE='baidu' -->
<view>weixin or baidu</view>
<!-- @endif -->

<!-- @if PACK_TYPE='weixin' && NODE_ENV='development' -->
<view>weixin and development</view>
<!-- @endif -->
```  
## 自定义plugin  
从3.2.0版本开始支持自定义plugin，设置`projectToSubPackageConfig.js`  
```javascript
// 定义插件
/**
* 插件接收content和pathObj参数，代表进入插件的文件内容和文件路径对象，返回的内容将作为该文件编译后的内容，不能返回null或者undefined，文件的路径是根据最终打包之后的项目文件路径
* @param content 文件内容
* @param pathObj {relative, absolute} 文件路径对象
* @param defaultPluginMap 系统插件对象，可以调用到系统插件
* @returns {*}
*/
function customPlugin (content, pathObj, defaultPluginMap) {
    if (pathObj.relative.match(/\\.wxml$/i)) {
        // 使用系统插件处理wxml
        return defaultPluginMap.htmlMixinPlugin(content, pathObj)
    }
    
    if (pathObj.relative.match(/\\.js$/i)) {
        return `var customVar = 12345;\n${content}`
    }
    return content
}

module.exports = {
    plugins: [
        'polyfillPlugin',
        // 插件1
        customPlugin,
        // 插件2
        function (content, pathObj, defaultPluginMap) {
            // 处理头条小程序没有 onUnhandledRejection
            // 对app.js处理
            if (process.env.PACK_TYPE === 'toutiao' && pathObj.relative.match(/^\/app.js$/)) {
                const injectCode = `
                    tt.onUnhandledRejection = function () {
                        // .......
                    };
                    \n
                `
                return injectCode + content
            }
            return content
        }
    ]
}
```  
自定义plugin是最后一步处理的，所以有最高编译权，最多的用途应该是处理混写中插件不能处理的一些不同端api不兼容的情况  
## 引入原生资源的wxs  
在uni的vue文件中引入原生资源目录的wxs同样需要使用`__uniRequireWx`
```html
<script module="test" lang="wxs">
// 跳出uni目录引入跟目录的原生wxs资源
__uniRequireWx('@wxResource/../static/test.wxs')
</script>
```  
或者  
```html
<wxs module="test">
// 跳出uni目录引入跟目录的原生wxs资源
__uniRequireWx('@wxResource/../static/test.wxs')
</wxs>
```  
## 与其他webpack打包后的文件进行混合时  
此情况一般出现在将uni项目打包后作为一个目录混合进其他小程序开发框架中，由于一些小程序开发框架也是使用webpack进行打包，会导致webpack的全局队列对象名称相互污染（默认是`global["webpackJsonp"]`），造成加载模块出现错误，所以建议此种情需要对作为目录的uni项目的`vue.config.js`进行配置，添加`output.library`  
```javascript
// vue.config.js
const webpack = require('webpack')
// 获取uniapp2wxpack的配置文件projectToSubPackageConfig.js的内容
const projectToSubPackageConfig = require('./projectToSubPackageConfig')
module.exports = {
    configureWebpack: {
        output: {
            // 也可以手动设置一个自己命名的常量
            library: projectToSubPackageConfig.subPackagePath
        }
    }
}
```  
这样设置后，uni项目打包出来的文件的webpack全局队列对象名称将被修改成`global["webpackJsonp" + output.library]`，这样就避免了对象名称污染的情况  
## 其他  
如果原生主小程序目录中已经存在了同uni解耦包命名相同的目录，在构建时，这个目录将被忽略，构建后的项目中的此目录是uni项目生成的解耦包
