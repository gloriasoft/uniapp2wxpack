# uniapp2wxpack   
  
问题反馈QQ群:701697982 <a target="_blank" href="https://jq.qq.com/?_wv=1027&k=2DjrpVZL" rel="nofollow"><img src="http://pub.idqqimg.com/wpa/images/group.png" alt="uniapp2wxpack问题反馈群"></a>  
## Uni-App的小程序解耦构建，并使uni-app支持混写模式  
### 解耦构建(暂支持微信、头条，支付宝，百度，其他小程序即将全支持)  
### 混写(暂支持微信、头条，其他小程序即将全支持)  
+ 可以将uni-app项目输出给任何原生小程序项目作为目录、作为分包、甚至做极端的项目混合
+ 可以直接在uni-app项目中引入原生小程序项目、页面、模块、任何资源，完全不需要修改原生小程序的代码  
+ 可以保持原生小程序的目录结构不变，同时开发uni-app文件和原生小程序文件  
+ 可以使uni-app进行微信原生小程序插件的开发✌（[详见微信小程序插件项目示例](https://github.com/devilwjp/uni-project-to-plugin)）  
+ **支持混写各小程序端代码，运行时都会转成目标端代码，无需分平台编写（原生代码也支持，意味着一套原生微信小程序代码，可发布成其他小程序代码）** ✌  
+ **可自定义插件，对文件进行自定义编译（见自定义plugin说明）** ✌  
+ **支持多套不同端的原生小程序代码直接在一个项目中进行开发，并且可发布成一套** ✌  
+ **支持原生小程序代码的条件编译（js、css、html均支持，见条件编译说明）** ✌  
+ 支持极端方式的原生小程序迁移到uni-app方式（原生项目与uni项目全目录混合，见极端方式的原生小程序迁移到uni-app说明）  
  
#### [点击进入微信小程序解耦开发项目示例](https://github.com/devilwjp/uni-project-to-subpackage)  
#### [点击进入头条小程序解耦开发项目示例](https://github.com/devilwjp/uni-project-to-ttpack)  
#### [点击进入支付宝小程序解耦开发项目示例](https://github.com/devilwjp/uni-project-to-alipayPack)  
#### [点击进入百度小程序解耦开发项目示例](https://github.com/devilwjp/uni-subpackage-swan-demo)

  
## Why?  
uni-app真的很好用，但是官方并未提供较为优雅的项目迁移和无损升级的方式（其实其他跨端框架也没有好的方案），最终决定实现一套为uni-app打造的融合开发模式解决方案，这套方案已经不是一套只针对项目迁移和升级的方案，而更是一套针对所有新项目推荐的架构设计体系。因为它本身已经是一套可以混写各端原生代码的跨端插件。插件采用二次编译的方式无损的对uni-app编译之后的文件进行再编译，这样的好处是uni-app的升级不会影响到插件本身。  

## 混写与跨端（详见混写说明）  
最初只是想提供一套能让uni-app更繁荣的架构模式，可以让uni-app与原生项目打通，自由的互相套用。为此，也提供了类似uni-app的platform的各端单独的原生小程序目录。插件的工作就是将原生小程序文件和uni-app小程序文件混合兼容，保证生命周期按需求体现。但这种设计并不纯粹和彻底，为什么不能直接让微信原生小程序项目与uni-app项目混合的同时可以做到发布成头条小程序项目呢？所以，插件单独实现了各原生小程序的**混写**功能，也就是一套原生小程序可以发布成多套其他的原生小程序。  

## 系统插件和自定义插件  
作为本身就是一个插件的角色来说，再提供一个自定义插件功能，有点多余，但是uni-app的静态编译原理，再加上原生小程序文件是插件单独处理的，导致一些高级玩家可以加入一些自己的想法再进行一次静态编译做到中心化的一些逻辑处理和视图层的处理。  
  
**插件功能及通过插件不断优化混写将是未来长期的工作**  
  
## 快速上手  
#### 第一步  
准备一个uni-app项目（需要使用vue-cli安装的uni-app项目，因为hbuildx安装的项目没有相关依赖和src目录）  
  
#### 第二步  
在项目根目录，安装uniapp2wxpack  
````  
npx uniapp2wxpack --create
````  
  
#### 第三步 
配置根目录下projectToSubPackageConfig.js，可按需要替换主小程序目录中的内容  
  
#### 第四步  
运行开发命令
````  
// 微信小程序开发
npm run dev:mp-weixin-pack
// 头条小程序开发
npm run dev:mp-toutiao-pack
// 支付宝小程序
npm run dev:mp-alipay-pack
// 百度小程序
npm run dev:mp-baidu-pack
````  
  
#### 第五步  
用小程序开发者工具预览dist/dev/mp-weixin-pack目录
  
### 安装  
在已有的**uni-app**项目中通过cli安装  
````  
// 推荐  
npx uniapp2wxpack --create

// 或者全局安装uniapp2wxpack
npm i uniapp2wxpack -g
uniapp2wxpack --create
````  
+ 会在项目中创建projectToSubPackageConfig.js  
+ 创建mainWeixinMp目录（可根据projectToSubPackageConfig.js的配置修改目录名）  
+ 在package.json中会生成以下命令  
dev:mp-weixin-pack  
dev:mp-toutiao-pack  
dev:mp-alipay-pack  
dev:mp-baidu-pack  
build:mp-weixin-pack  
build:mp-toutiao-pack  
build:mp-alipay-pack  
build:mp-baidu-pack  
dev:mp-weixin-pack-plugin  
build:mp-weixin-pack-plugin  

## 重要！！使用场景描述（以微信小程序为例）  
### 原生小程序项目和uni-app项目同时开发  
+ 插件安装完以后会在uni项目根目录下生成`mainWeixinMp`目录（微信）代表了是存放原生小程序的目录  
+ uni自己项目的结构不需要变  
+ uni的相关页面配置在uni目录的`pages.json`(如果不设置`indexPage`，以原生`app.json`第一个页面为首页)  
+ 原生小程序的相关页面配置在原生小程序的`app.json`  
+ 在uni项目根目录下执行`npm run dev:mp-weixin-pack`  
+ 使用微信小程序的ide预览构建后的目录`dist/dev/mp-weixin-pack`  
+ 如果需要修改相关的目录名称可以自行修改uni项目根目录下的`projectToSubPackageConfig.js`  
+ 构建后的目录的`app.json`会根据原生小程序的`app.json`为主，比如包括`extjson`的设置、`tabbar`的设置、`navigation`的设置等一切的全局设置都需要配置在原生的`app.json`中（如果以前配置在了uni项目的`pages.json`里，请移至`mainWeixinMp`的`app.json`中）  
+ 构建后的目录会以原生小程序为根，uni项目会被分配到一个指定目录中，默认为`uniSubpackage`（可以在`projectToSubPackageConfig.js`中修改），如果不想将uni项目分配到子目录而是占据根目录，则需要配置`极端混合`模式（参考文档中`极端混合`模式的配置）  
+ 非极端混合模式的场景一般都会遇到页面跳转的路径问题，属于正常情况，因为uni项目被指定到了一个子目录中，可以参考文档底部的`路径问题`，或者参考`pack.config.js`的使用说明，或者在uni项目内使用相对路径跳转  

### 重要！！关于分包的场景  
#### 将整个uni项目作为原生小程序的分包  
在`mainWeixinMp/app.json`中，将`uniSubpackage`设置为分包目录  
**注意：subPackages里的pages设为空数组**   
app.json  
````javascript
{
  "subPackages":[{
    "root":"uniSubpackage",
    "pages":[]
  }]
}
````  
#### 将原生小程序作为分包，将uni作为主包  
首先应该使用`极端混合`模式，然后在`mainWeixinMp`目中建立一个目录用来指明原生小程序的分包名称，比如`nativeSubpackage`    
将原生小程序的分包项目或者相关文件放置在`mainWeixinMp/nativeSubpackage`中  
在`mainWeixinMp/app.json`中，将`nativeSubpackage`设置为分包目录  
app.json  
````javascript
{
  "subPackages":[{
    "root":"nativeSubpackage",
    "pages":[
        "pages/index/index",
        "pages/about/about"
    ]
  }]
}
````  
#### 其他更复杂的分包模式（比如uni项目中自己的分包结合原生小程序中自己的分包，见`解耦构建分包配置场景示例`）  

### 概念 
+ uni-app项目目录   
    + project/src  
+ 主小程序项目（原生）目录  
    + project/mainWeixinMp   (可根据不同的平台单独进行配置修改)  
+ uni-app项目中的原生小程序页面（或资源）目录  
    + project/src/wxresource（头条是ttresource,支付宝是myresource,百度是swanresource，也可设置成同一个）   
+ uni-app项目打包输出之后在主小程序项目中的目录  
    + uniSubpackage (可进行配置修改)  

### 升级之后的脚手架结构 
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
### 开发模式  
+ 单独开发解耦包  
在mainWeixinMp目录放置用于预览的原生小程序项目（hello world小程序即可），然后正常的在src中进行编码开发，解耦包打包完成后的包文件在dist/build/mp-weixin-pack/包名称  
  
+ 与完整小程序项目协同开发  
此时mainWeixinMp目录应该是真实的小程序项目（建议关联真实小程序项目的git仓库，mainWeixinMp作为一个git子仓库的存在），构建打包完成后即可将打包后内容(dist/build/mp-weixin-pack)覆盖mainWeixinMp的内容进行子仓库提交   

### 运行  
可根据实际项目情况修改以下两个命令的内容
````
// 微信小程序开发
npm run dev:mp-weixin-pack
// 头条小程序开发
npm run dev:mp-toutiao-pack
// 支付宝小程序
npm run dev:mp-alipay-pack
// 百度小程序
npm run dev:mp-baidu-pack

// 微信小程序打包
npm run build:mp-weixin-pack
// 头条小程序打包
npm run build:mp-toutiao-pack
// 支付宝小程序
npm run build:mp-alipay-pack
// 百度小程序
npm run build:mp-baidu-pack
````  

### projectToSubPackageConfig.js   
解耦包配置文件  
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

### wxresource目录（头条是ttresource,支付宝是myresource,百度是swanresource）  
uni-app源码中要使用的原生页面及资源存放的目录  
wxresource目录中的页面都必须配置在pages.json的wxResource属性里  
**注意：wxresource目录构建后所在的物理路径，实际上就是src目录所在的路径，也就是uni包目录本身，所以构建后，wxresource中的文件和目录将被移动至uniSubpackage下，如果内容中有目录于src相同，则将会融合，目录名文件名都相同则将被丢弃**  
  
### appMode  
由于uni项目的App.vue对应小程序的app.js，在解耦包的模式中，会对主小程序的app.js产生冲突。  
所以设置了三种模式对App.vue进行处理，可以在projectToSubPackageConfig.js设置  
    
+ relegation (降级模式，默认)  
降级模式的含义是将uni目录从项目级别降级到了目录级别，那么App.vue中的钩子函数就只对目录有效  
比如：App.vue中的onLaunch，会降级成首次进入uni目录才触发，同样的，onHide会降级成只要离开uni目录的范围就会触发  
  
+ top (顶级模式)  
顶级模式的含义就是把uni的App.vue中的钩子和主小程序的app.js的钩子混合在一起  
**注意：顶级模式中uni包不能以分包形式存在，只能以主包的子目录形式存在（否则无法确保onLaunch的准确性），需要确保主小程序的app.js中引入了uni项目的app.js(自有项目会自动添加引入，如果是把构建解耦包提供给其他项目，需要其他项目的根目录下的app.js手动引入)**  
**如果不需要在根app.js中依赖uni包的方法和属性，可以不引用uni包的app.js，uni包依旧可以准确的触发onLauch和onShow**  
  
+ none (丢弃模式)  
丢弃模式就是不处理App.vue中的钩子  
#####  
降级模式和顶级模式都会将globalData和getApp()返回的内容进行混合  
所有模式都会将App.vue的初始设置保存在wx.__uniapp2wxpack.uniSubpackage.__packInit中（uniSubpackage属性是和uni的目录名保持一致的，如果修改目录名，属性名也会变更）  

**注意：如果要手动通过wx.__uniapp2wxpack触发App的钩子，需要首先确保触发onLaunch，否则App的onShow和onHide不会有效**  

### API  
+ wx.__uniapp2wxpack  
用于存放解耦包相关方法和数据的对象，在引入解耦包的app.js后，通过获取wx.__uniapp2wxpack.uniSubpackage.__packInit，可以拿到uni项目App.vue的初始化配置  
**注意：其中uniSubpackage属性代表了解耦包的名称，名称变化，该属性也会相应的改变**
  
+ __uniRequireWx (所有小程序也通用)  
只支持静态字符串参数  
在uni-app项目的源码目录中的vue、js文件需要引入原生的微信小程序资源（除了uni-app自带的wxcomponents目录外）都需要使用__uniRequireWx方法(类似node的require)，并且往往会配合目录别名@wxResource
````javascript
const nativeResource = __uniRequireWx('@wxResource/nativeJs/test')
const nativeExportDefaultObject = __uniRequireWx('@wxResource/nativeJs/test1').defaut
const {nativeRestObject} =  __uniRequireWx('@wxResource/nativeJs/test')
````  
+ __uniWxss (所有小程序也通用)  
只支持静态字符串参数  
在uni-app项目的源码目录中的vue、scss、less文件中引入原生的微信小程序wxss、ttss资源(类似@import 'xxxxxx'),往往会配合目录别名@wxResource  
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
@wxResource只能在__uniRequireWx和__uniWxss中使用  
+ 指向src/wxresource(头条是ttresource,支付宝是myresource,百度是swanresource)  
+ 指向构建后的原生小程序项目中的uni解耦包目录  
#### 意味着src/wxresource(头条是ttresource,支付宝是myresource,百度是swanresource)会和uni解耦包融合构建  
````javascript  
// 跳出uni解耦包的目录，访问上层资源
__uniRequireWx('../@wxResource/top/1.js')
__uniRequireWx('@wxResource/../top/1.js')

// 绝对路径访问(访问原生小程序的根目录下的top/1.js)
__uniRequireWx('/top/1.js')
````  
### pack.config.js  
在构建完成的原生小程序项目中的uni解耦包目录下会存在pack.config.js，这个文件仅仅是保存了uni解耦包在主小程序中的目录名，以便解耦包中使用了动态路径（非相对路径）跳转页面或者加载图片地址  
注意：路径中保存的是绝对路径  
````javascript
const { packPath } = __uniRequireWx('@wxResource/pack.config.js')
uni.navigateTo({
    url: packPath + '/pages/about'
})
````  
### pages.json、主小程序的app.json混合处理  
+ 设置uni项目为分包  
需要在主小程序的app.json里配置分包的root，并且pages设置为[]  
构建时会把uni项目中的所有pages和subPackages中的pages都合并到预览目录中app.json的uni分包配置的pages里
````javascript
  // mainWeixinMp app.json
  "subPackages":[{
    "root":"uniSubpackage",
    "pages":[]
  }]
````  
+ 设置uni项目为主包并配置目录下的一些资源为分包  
在uni项目的pages.json里设置pages和subPackages  
+ 在uni项目中设置wxresource(头条是ttresource,支付宝是myresource,百度是swanresource)中的pages和subPackages  
需要在uni项目中的pages.json中的wxResource中配置pages和subPackages

### 解耦构建分包配置场景示例  
#### 场景一  
在uni项目中的vue页面分包  
pages.json  
````javascript
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
#### 场景二  
在wxresource中使用分包  
pages.json
````javascript
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
#### 场景三  
uni项目中vue页面和原生页面，在构建后同时在一个目录里，设置分包  
虽然设置在了不同的地方，但是构建后会合并到一起
````javascript
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
#### 场景四  
在小程序的app.json(mainWeixinMp/app.json)中将整个uniSubpackage配置成分包  
只需要对app.json进行配置即可，不需要修改pages.json中的subPackages和pages设置，构建后会将pages.json中所有的页面路径都抽取到uniSubpackage分包的配置里  
mainWeixinMp/app.json中的分包配置  
**注意：subPackages里的pages设为空数组**  
````javascript  
{
  "subPackages":[{
    "root":"uniSubpackage",
    "pages":[]
  }]
}
````
### 混写说明  
从3.2.0版本开始支持混写功能，无论是原生小程序文件还是uni-app的文件都可以直接使用某一端的全局对象来和相关html和css的自有文件，插件会统一转换成目标端的规范。在projectToSubPackageConfig.js中，可以将各不同端的原生资源目录设置成同一个，放心的交给插件来处理，可能会有一些特殊段api不兼容的情况，在原生代码中可以通过条件编译来做一些不同平台的条件判断。  
**(系统默认全局对个小程序平台文件后缀名进行混写，其他更多的混写需要在插件中配置)**  
  
例如，我们将微信原生目录(mainWeixinMpPath)和头条原生目录(mainToutiaoMpPath)设置成一个allNativeMp，将原生原生资源和头条原生资源的对应动态目录(wxResourcePath)也设置成一个常量src/allresource，可以任意混写不同端的代码。最后配置插件，开启更高级的混写，混写只能对不是太复杂的页面进行处理，复杂业务的页面混写处理后可能还是有有问题，需要手动通过条件编译进行修复  
projectToSubPackageConfig.js
```javascript
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
这里需要注意的是，现在的混写只是处理各端全局对象(比如wx,swan,tt等)和文件名(比如wxml、wxss、ttml、ttss、swan、css等)，如果遇到是各端api和组件的差异，仍然需要开发者自行处理，开发者可以在自定义plugin中进行中心化的处理，也可以在项目代码中直接通过区分不同端来处理  
  
### 系统plugin  
从3.2.0版本开始支持plugin，设置projectToSubPackageConfig.js, 现在支持3个系统插件  
插件处理的文件路径是经过打包后的路径，就是在dist目录中各环境各端的pack目录中的物理路径  
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
### 条件编译  
从3.2.1开始，提供了3个支持原生小程序代码的条件编译系统插件, 通过判断PACK_TYPE可以进行平台的条件判断，也可以在启动命令中加入自定义的环境变量进行判断（一切在uniapp2wxpack进程中的process.env对象中的环境变量都能被用于判断）  
原生小程序条件编译的语法与uni-app的条件编译略有差异  
**jsPreProcessPlugin**  
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
**cssPreProcessPlugin**  
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
**htmlPreProcessPlugin**  
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
### 自定义plugin  
从3.2.0版本开始支持自定义plugin，设置projectToSubPackageConfig.js  
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
    if (pathObj.relative.match(/.wxml$/i)) {
        // 使用系统插件处理wxml
        return defaultPluginMap.htmlMixinPlugin(content, pathObj)
    }
    
    if (pathObj.relative.match(/.js$/i)) {
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
  
### 极端方式的原生小程序项目迁移到uni-app项目  
将完整的微信原生小程序项目，保证目录结构不变的情况下迁移到uni-app中，使uni-app的目录结构与原生项目的目录结构保持一致（不单独区分uniSubpackage目录）  
规则：  
1. 当原生文件路径与uni打包后的文件路径冲突时，以uni打包后的文件为优先  
2. 根目录的app.js和app.wxss以原生项目的文件路径为优先，并且会做特殊的混合处理，将uni打包后的app.js和app.wxss与原生的文件混合  
#### 配置极端方式迁移  
仅需要配置projectToSubPackageConfig.js即可，并且项目中的pack.config.js的packPath属性也会自动变成空字符  
```javascript
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
  
### 引入原生资源的wxs  
在uni的vue文件中引入原生资源目录的wxs同样需要使用__uniRequireWx
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
  
### 路径问题  
**uni项目中如果使用了绝对路径，在解耦构建的项目中，根路径是指向了主小程序的根的，所以需要自行拼接上uni解耦包的目录名，推荐使用pack.config.js中的packPath动态获取拼接**  
  
### 其他  
如果原生主小程序目录中已经存在了同uni解耦包命名相同的目录，在构建时，这个目录将被忽略，构建后的项目中的此目录是uni项目生成的解耦包
