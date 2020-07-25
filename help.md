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
