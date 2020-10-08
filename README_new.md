# uniapp2wxpack   
  
问题反馈QQ群:701697982 <a target="_blank" href="https://jq.qq.com/?_wv=1027&k=2DjrpVZL" rel="nofollow"><img src="http://pub.idqqimg.com/wpa/images/group.png" alt="uniapp2wxpack问题反馈群"></a>  
  
## Uni-App的小程序混合开发（解耦构建）插件  
+ 原生开发的小程序仍保留，部分新功能使用uni-app开发。  
+ uni-app开发的小程序项目整个作为一个目录集成到其他原生开发的小程序中（或者任何框架开发最终构建成的原生小程序）。  
+ 使用uni-app开发微信小程序插件  

## 示例项目  
#### [点击进入微信小程序混合开发项目示例](https://github.com/devilwjp/uni-project-to-subpackage)  
#### [点击进入头条小程序混合开发项目示例](https://github.com/devilwjp/uni-project-to-ttpack)  
#### [点击进入支付宝小程序混合开发项目示例](https://github.com/devilwjp/uni-project-to-alipayPack)  
#### [点击进入百度小程序混合开发项目示例](https://github.com/devilwjp/uni-subpackage-swan-demo)  
#### [点击进入使用uni-app开发微信小程序插件的示例](https://github.com/devilwjp/uni-project-to-plugin)  

## 快速上手  
#### 第一步  
准备一个uni-app项目（**需要使用vue-cli安装的uni-app项目，因为hbuildx安装的项目没有相关依赖和src目录**）  
  
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
  
### 安装之后
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
### 一些重要的概念 
+ uni-app项目目录   
    + project/src  
+ 原生小程序项目（原生）目录  
    + project/mainWeixinMp   (可根据不同的平台单独进行配置修改)  
+ uni-app项目中的原生小程序页面（或资源）目录（可缺省）  
    + project/src/wxresource（头条是ttresource,支付宝是myresource,百度是swanresource，也可设置成同一个）   
+ uni-app项目打包输出之后在主小程序（原生）项目中的目录  
    + project/dist/dev/uniSubpackage (可进行配置修改)  
+ **uniapp2wxpack的配置文件**
    + project/projectToSubPackageConfig.js  
