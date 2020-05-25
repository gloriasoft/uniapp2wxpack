"use strict";function e(e){return e&&"object"==typeof e&&"default"in e?e.default:e}var t=e(require("del")),n=e(require("gulp")),a=e(require("path")),i=e(require("commander")),r=e(require("single-line-log")),s=e(require("gulp-load-plugins")),p=e(require("fs-extra")),o=e(require("strip-json-comments")),c=e(require("parse5")),u=e(require("gulp-strip-comments"));const{program:l}=i;l.option("--scope <type>","运行目录",process.cwd()).option("--plugin","插件模式"),l.parse(process.argv);const f=l.scope,g=function(){return require.apply(null,arguments)}(a.resolve(f,"./projectToSubPackageConfig")),w=g.wxResourcePath||"src/wxresource",d=g.wxResourceAlias||"@wxResource",h=RegExp(d+"\\/","g"),m=g.uniRequireApiName||"__uniRequireWx",x=RegExp(m+"\\(([a-zA-Z.\\/\"'@\\d]+)\\)","g"),v=g.uniImportWxssApiName||"__uniWxss",P=RegExp(`(}|^|\\s|;)${v}\\s*{([^{}]+)}`,"g");let y="dev";"production"===process.env.NODE_ENV&&(y="build");const k="dist/"+y+"/mp-weixin";let b="dist/"+y+"/mp-weixin-pack";l.plugin&&(b="dist/"+y+"/mp-weixin-pack-plugin");var j={program:l,cwd:f,projectToSubPackageConfig:g,wxResourcePath:w,wxResourceAlias:d,regExpWxResources:h,uniRequireApiName:m,regExpUniRequire:x,uniImportWxssApiName:v,regExpUniImportWxss:P,configWxResourceKey:g.configWxResourceKey||"wxResource",env:y,base:k,target:b,basePath:a.resolve(f,k),subModePath:a.resolve(f,b,g.subPackagePath),targetPath:a.resolve(f,b),packIsSubpackage:{mode:!1}};let S;const _=r.stdout;var L={tryAgain:async function(e){return new Promise(async t=>{setTimeout(async()=>{t(await e())},100)})},getLevelPath:function(e){return Array(e).fill("../").join("")},getLevel:function(e){return e.split(/[\\/]/).length-1},writeLastLine:function(e){_(e),clearTimeout(S),S=setTimeout(()=>{_("解耦构建，正在监听中......(此过程如果出现权限问题，请使用管理员权限运行)")},300)}};const{basePath:A}=j,{tryAgain:E}=L;n.task("clean:base",(async function e(n){try{await t([A+"/**/*"],{force:!0})}catch(t){return void await E(async()=>{await e(n)})}n()}));const{subModePath:R}=j,{tryAgain:C}=L;n.task("clean:subModePath",(async function e(n){try{await t([R+"/**/*"],{force:!0})}catch(t){return void await C(async()=>{await e(n)})}n()}));const{targetPath:N}=j,{tryAgain:W}=L;n.task("clean:previewDist",(async function e(n){try{await t([N+"/**/*"],{force:!0})}catch(t){return void await W(async()=>{await e(n)})}n()}));const M=s(),{cwd:J,projectToSubPackageConfig:q,target:B,env:O}=j,{writeLastLine:$}=L;n.task("watch:pluginJson",(function(){return n.src("src/plugin.json",{allowEmpty:!0,cwd:J}).pipe(M.if("dev"===O,M.watch("src/plugin.json",{cwd:J},(function(e){$("处理"+e.relative+"......")})))).pipe(n.dest(B+"/"+q.subPackagePath,{cwd:J}))}));const I=s(),{cwd:U,target:F,env:T}=j,{writeLastLine:D}=L;n.task("watch:projectConfigJson",(function(){return n.src("project.config.json",{allowEmpty:!0,cwd:U}).pipe(I.if("dev"===T,I.watch("project.config.json",{cwd:U},(function(e){D("处理"+e.relative+"......")})))).pipe(n.dest(F,{cwd:U}))}));const{program:H,cwd:K,projectToSubPackageConfig:z,basePath:V,subModePath:Z,targetPath:G,packIsSubpackage:Q}=j;var X=function(){if(H.plugin)return;const e=a.resolve(K,z.mainWeixinMpPath+"/app.js");if(p.existsSync(e)){const t=p.readFileSync(e,"utf8");let n=`require('${`./${z.subPackagePath}/`}app.js');\n`;if(Z===G){n=p.readFileSync(V+"/app.js","utf8")+";\n"}(Q.mode||H.plugin)&&(n=""),p.outputFileSync(G+"/app.js",n+t)}};const Y=s(),{program:ee,cwd:te,projectToSubPackageConfig:ne,configWxResourceKey:ae,base:ie,packIsSubpackage:re}=j,{writeLastLine:se}=L;var pe=function(e){return se("处理app.json......"),Y.replace(/[\s\S]+/,(function(t){if(ee.plugin&&"mainAppJson"===e)return t;re.mode=!1;let n,i,r,s={};({pagesJson(){try{n=JSON.parse(o(t))}catch(e){n={}}},baseAppJson(){try{i=JSON.parse(t)}catch(e){i={}}},mainAppJson(){try{r=JSON.parse(t)}catch(e){r={}}}})[e]();try{n||(n=JSON.parse(o(p.readFileSync(a.resolve(te,"src/pages.json"),"utf8"))))}catch(e){n={}}try{i||(i=JSON.parse(p.readFileSync(a.resolve(te,ie+"/app.json"),"utf8")))}catch(e){i={}}try{r||(r=JSON.parse(p.readFileSync(a.resolve(te,ne.mainWeixinMpPath+"/app.json"),"utf8")))}catch(e){r={}}function c(e){return ne.subPackagePath+(ne.subPackagePath?"/":"")+e}if(r.subPackages){let e=r.subPackages.find(e=>e.root===ne.subPackagePath);if(e){re.mode=!0;let t=[...n[ae]&&n[ae].pages||[],...i.pages||[]];return i.subPackages&&i.subPackages.forEach(e=>{t=[...t,...(e.pages||[]).map(t=>e.root+(e.root?"/":"")+t)]}),n[ae]&&n[ae].subPackages&&n[ae].subPackages.forEach(e=>{t=[...t,...(e.pages||[]).map(t=>e.root+(e.root?"/":"")+t)]}),e.pages=t,X(),delete i.pages,delete i.subPackages,JSON.stringify({...i,...r},null,2)}}i.pages&&i.pages.forEach((e,t)=>{i.pages[t]=c(e)}),i.subPackages&&i.subPackages.forEach(e=>{e.root=c(e.root)}),n[ae]&&(n[ae].pages&&n[ae].pages.forEach((e,t)=>{n[ae].pages[t]=c(e)}),n[ae].subPackages&&n[ae].subPackages.forEach(e=>{e.root=c(e.root)})),i.tabBar&&i.tabBar.list&&i.tabBar.list.forEach(({pagePath:e,iconPath:t,selectedIconPath:n,...a},r)=>{i.tabBar.list[r]={pagePath:e?c(e):"",iconPath:t?c(t):"",selectedIconPath:n?c(n):"",...a}}),s={...i,...r},s.pages=Array.from(new Set([...n.indexPage?[c(n.indexPage)]:[],...r.pages||[],...i.pages||[],...n[ae]&&n[ae].pages||[]]));let u=[],l={};function f(e){e.forEach(e=>{l[e.root]=l[e.root]?Array.from(new Set([...l[e.root],...e.pages])):e.pages})}f(n[ae]&&n[ae].subPackages||[]),f(i.subPackages||[]),f(r.subPackages||[]);for(let e in l)u.push({root:e,pages:l[e]});if(s.subPackages=[...u],i.usingComponents){for(let e in i.usingComponents)i.usingComponents[e]="/"+ne.subPackagePath+i.usingComponents[e];s.usingComponents={...s.usingComponents||{},...i.usingComponents}}return X(),JSON.stringify(s,null,2)}),{skipBinary:!1})};const oe=s(),{cwd:ce,target:ue,env:le}=j,{writeLastLine:fe}=L;n.task("watch:pagesJson",(function(){return n.src("src/pages.json",{allowEmpty:!0,cwd:ce}).pipe(oe.if("dev"===le,oe.watch("src/pages.json",{cwd:ce},(function(e){fe("处理"+e.relative+"......")})))).pipe(pe("pagesJson")).pipe(oe.rename("app.json")).pipe(n.dest(ue,{cwd:ce}))}));const ge=s(),{cwd:we,target:de,env:he,base:me}=j,{writeLastLine:xe}=L;n.task("watch:baseAppJson",(function(){return n.src(me+"/app.json",{allowEmpty:!0,cwd:we}).pipe(ge.if("dev"===he,ge.watch(me+"/app.json",{cwd:we},(function(e){xe("处理"+e.relative+"......")})))).pipe(pe("baseAppJson")).pipe(n.dest(de,{cwd:we}))}));const ve=s(),{cwd:Pe,target:ye,env:ke,projectToSubPackageConfig:be,program:je}=j,{writeLastLine:Se}=L;n.task("watch:mainAppJson",(function(){let e=be.mainWeixinMpPath;return n.src(e+"/app.json",{allowEmpty:!0,cwd:Pe}).pipe(ve.if("dev"===ke,ve.watch(e+"/app.json",{cwd:Pe},(function(e){Se("处理"+e.relative+"......")})))).pipe(pe("mainAppJson")).pipe(n.dest(ye+(je.plugin?"/miniprogram":""),{cwd:Pe}))}));const _e=s(),{cwd:Le,target:Ae,env:Ee,projectToSubPackageConfig:Re,program:Ce,basePath:Ne}=j,{writeLastLine:We}=L;n.task("watch:topMode-mainAppJsAndAppWxss",(function(){let e=Re.mainWeixinMpPath;const t=_e.filter([e+"/app.wxss"],{restore:!0}),a=_e.filter([e+"/app.js"],{restore:!0});return n.src([e+"/app.js",e+"/app.wxss"],{allowEmpty:!0,cwd:Le}).pipe(_e.if("dev"===Ee,_e.watch([e+"/app.js",e+"/app.wxss"],{cwd:Le},(function(e){We("处理"+e.relative+"......")})))).pipe(a).pipe(_e.replace(/^/,(function(e){return fs.readFileSync(Ne+"/app.js","utf8")+";\n"}),{skipBinary:!1})).pipe(a.restore).pipe(t).pipe(_e.replace(/^/,(function(e){return fs.readFileSync(Ne+"/app.wxss","utf8")+"\n"}),{skipBinary:!1})).pipe(t.restore).pipe(n.dest(Ae+(Ce.plugin?"/miniprogram":""),{cwd:Le}))}));const Me=s(),{cwd:Je,target:qe,env:Be,projectToSubPackageConfig:Oe,base:$e}=j,{writeLastLine:Ie}=L;n.task("watch:mainWeixinMpPackPath",(function(){const e=Oe.mainWeixinMpPath,i=e+"/"+Oe.subPackagePath,r=qe+"/"+Oe.subPackagePath;return n.src([i,i+"/**/*","!"+i+"/pack.config.js"],{allowEmpty:!0,cwd:Je}).pipe(Me.if("dev"===Be,Me.watch([i,i+"/**/*","!/"+i+"/pack.config.js"],{cwd:Je},(function(e){Ie("处理"+e.relative+"......")})))).pipe(Me.filter((function(n){if(!function(e){const t=t,n=Oe.mainWeixinMpPath+"/"+Oe.subPackagePath;return!fs.existsSync(e.path.replace(a.resolve(Je,n),a.resolve(Je,$e)))&&!fs.existsSync(e.path.replace(a.resolve(Je,n),a.resolve(Je,t)))}(n))return!1;if("unlink"===n.event){try{t.sync([n.path.replace(a.resolve(Je,e),a.resolve(Je,qe))],{force:!0})}catch(e){}return!1}return!0}))).pipe(n.dest(r,{cwd:Je}))}));const Ue=s(),{cwd:Fe,target:Te,env:De,projectToSubPackageConfig:He,basePath:Ke,subModePath:ze,targetPath:Ve,program:Ze,packIsSubpackage:Ge}=j,{writeLastLine:Qe}=L;n.task("watch:mainWeixinMp",(function(){let e=He.mainWeixinMpPath,i=e+"/"+He.subPackagePath,r=Ue.filter([e+"/app.js"],{restore:!0});return n.src([e+"/**/*","!"+e+"/app.json","!"+e+"/**/*.json___jb_tmp___","!"+e+"/**/*.wxml___jb_tmp___","!"+e+"/**/*.wxss___jb_tmp___","!"+e+"/**/*.js___jb_tmp___","!"+i+"/**/*"],{base:a.resolve(Fe,e),allowEmpty:!0,cwd:Fe}).pipe(Ue.if("dev"===De,Ue.watch([e+"/**/*","!/"+e+"/app.json","!/"+i+"/**/*"],{cwd:Fe},(function(e){Qe("处理"+e.relative+"......")})))).pipe(Ue.filter((function(n){if("unlink"===n.event){try{t.sync([n.path.replace(a.resolve(Fe,e),a.resolve(Fe,Te))],{force:!0})}catch(e){}return!1}return!0}))).pipe(r).pipe(Ue.replace(/^/,(function(e){if(Ge.mode||Ze.plugin)return"";let t=`./${He.subPackagePath}/`;if(ze===Ve){return fs.readFileSync(Ke+"/app.js","utf8")+";\n"}return`require('${t}app.js');\n`}),{skipBinary:!1})).pipe(r.restore).pipe(n.dest(Te+(Ze.plugin?"/miniprogram":""),{cwd:Fe}))}));var Xe={fakeUniBootstrap:function(e,t,n){wx.__uniapp2wxpack||(wx.__uniapp2wxpack={});var a=wx.__uniapp2wxpack[t.replace("/","")]={__packInit:{}};if(e)for(var i in e)"function"!=typeof e[i]?a.__packInit[i]=e[i]:function(t){a.__packInit[t]=function(){return e[t].apply(e,arguments)}}(i);else e={};if("none"!==n){var r=Page,s=Component,p="",o=1,c=1;"function"==typeof e.onError&&wx.onError((function(){return e.onError.apply(e,arguments)})),"function"==typeof e.onPageNotFound&&wx.onPageNotFound((function(){return e.onPageNotFound.apply(e,arguments)})),"function"==typeof e.onUnhandledRejection&&wx.onUnhandledRejection((function(){return e.onUnhandledRejection.apply(e,arguments)})),wx.onAppRoute((function(a){"top"!==n&&0!==("/"+a.path).indexOf(t+"/")&&(o=1,e.onHide.call(e,wx.getLaunchOptionsSync())),p=a.path})),wx.onAppHide((function(){if("top"===n)return e.onHide.call(e,wx.getLaunchOptionsSync());var a=getCurrentPages();return 0===("/"+a[a.length-1].route).indexOf(t+"/")?(o=1,p="",e.onHide.call(e,wx.getLaunchOptionsSync())):void 0})),wx.onAppShow((function(){"top"===n&&"function"==typeof e.onShow&&e.onShow.call(e,wx.getLaunchOptionsSync()),c&&getApp()&&(getApp().globalData||(getApp().globalData={}),Object.assign(getApp().globalData,e.globalData||{})),c=0})),"top"===n&&c&&"function"==typeof e.onLaunch&&e.onLaunch.call(e,wx.getLaunchOptionsSync()),Page=function(e){return u(e),r.call(this,e)},Component=function(e){return u(e.methods||{}),s.call(this,e)}}function u(a){if("top"!==n){var i=a.onShow;"function"!=typeof e.onShow&&"function"!=typeof e.onLaunch||(a.onShow=function(){var n=getCurrentPages();if(p&&0===("/"+p).indexOf(t+"/")||0!==("/"+n[n.length-1].route).indexOf(t+"/")||(o&&(o=0,e.onLaunch.call(e,wx.getLaunchOptionsSync())),e.onShow.call(e,wx.getLaunchOptionsSync())),"function"==typeof i)return i.apply(this,arguments)})}}},fakeUniBootstrapName:"fakeUniBootstrap"};const Ye=s(),{regExpWxResources:et,regExpUniRequire:tt}=j,{getLevelPath:nt,getLevel:at}=L;var it={uniRequireWxResource:function(){return Ye.replace(tt,(function(e,t,n,a){const i=at(this.file.relative);return console.log(`\n编译${e}--\x3erequire(${t.replace(et,nt(i))})`),`require(${t.replace(et,nt(i))})`}),{skipBinary:!1})}};const rt=s(),{fakeUniBootstrapName:st,fakeUniBootstrap:pt}=Xe,{cwd:ot,env:ct,program:ut,basePath:lt,targetPath:ft,subModePath:gt,base:wt,regExpUniRequire:dt,regExpWxResources:ht,regExpUniImportWxss:mt,wxResourceAlias:xt}=j,{writeLastLine:vt,getLevel:Pt,getLevelPath:yt}=L,{uniRequireWxResource:kt}=it;n.task("subMode:createUniSubPackage",(function(){p.mkdirsSync(lt);const e=rt.filter([wt+"/common/vendor.js",wt+"/common/main.js",wt+"/common/runtime.js",wt+"/pages/**/*.js"],{restore:!0}),i=rt.filter([wt+"/common/vendor.js"],{restore:!0}),r=rt.filter([wt+"/common/main.js"],{restore:!0}),s=rt.filter([wt+"/**/*.js","!"+wt+"/app.js","!"+wt+"/common/vendor.js","!"+wt+"/common/main.js","!"+wt+"/common/runtime.js"],{restore:!0}),o=rt.filter([wt+"/**/*.wxss","!"+wt+"/app.wxss","!"+wt+"/common/main.wxss"],{restore:!0}),l=rt.filter([wt+"/**/*.wxss","!"+wt+"/app.wxss"],{restore:!0}),f=rt.filter([wt+"/**/*.json"],{restore:!0}),g=rt.filter([wt+"/**/*.wxml"],{restore:!0});return n.src([wt+"/**","!"+wt+"/*.*",wt+"/app.js",wt+"/app.wxss"],{allowEmpty:!0,cwd:ot}).pipe(rt.if("dev"===ct,rt.watch([wt+"/**/*","!/"+wt+"/*.json"],{cwd:ot},(function(e){vt("处理"+e.relative+"......")})))).pipe(rt.filter((function(e){if(function(e){const t=a.resolve(ft,"app.js"),n=a.resolve(ft,"app.wxss"),i=e.path.replace(lt,gt);return t===i||n===i}(e))return!1;if("unlink"===e.event){try{t.sync([e.path.replace(lt,a.resolve(ot,gt))],{force:!0})}catch(e){}return!1}return!0}))).pipe(g).pipe(rt.replace(/[\s\S]*/,(function(e){const t=c.parse(e);let n=0;const a=t.childNodes[0].childNodes[1];return function e(t,n){n&&(n(t),t.childNodes&&t.childNodes.forEach(t=>{e(t,n)}))}(t,e=>{if("img"===e.nodeName&&(e.nodeName="image",e.tagName="image"),"#text"===e.nodeName&&"wxs"===e.parentNode.nodeName){e.value.replace(dt,(t,a,i,r)=>{const s=Pt(this.file.relative),p=a.replace(ht,yt(s)).replace(/['"]/g,"");e.parentNode.attrs.push({name:"src",value:p}),e.parentNode.childNodes=[],n=1,console.log(`\n编译${t}--\x3erequire(${p})`)})}}),n?c.serialize(a):e}),{skipBinary:!1})).pipe(g.restore).pipe(i).pipe(rt.replace(/^/,(function(e){return ut.plugin?"var App=function(packInit){};wx.canIUse=function(){return false};":`var __packConfig=require('../pack.config.js');var App=function(packInit){var ${st}=${""+pt};${st}(packInit,__packConfig.packPath,__packConfig.appMode);};`}),{skipBinary:!1})).pipe(i.restore).pipe(e).pipe(u()).pipe(kt()).pipe(e.restore).pipe(r).pipe(rt.replace(/^/,(function(e){return"var __uniPluginExports={};\n"}),{skipBinary:!1})).pipe(rt.replace(/$/,(function(e){return"\nmodule.exports=__uniPluginExports;"}),{skipBinary:!1})).pipe(r.restore).pipe(s).pipe(rt.replace(/^/,(function(e){if(p.existsSync(a.resolve(ot,"src",this.file.relative)))return e;return`require('${yt(Pt(this.file.relative))}app.js');\n`}),{skipBinary:!1})).pipe(s.restore).pipe(f).pipe(rt.replace(/[\s\S]*/,(function(e){if(!p.existsSync(a.resolve(ot,"src",this.file.relative.replace(/json$/,"vue")))&&!p.existsSync(a.resolve(ot,"src",this.file.relative.replace(/json$/,"nvue"))))return e;let t=JSON.parse(""+this.file.contents);for(let e in t.usingComponents)0===t.usingComponents[e].indexOf("/")&&(t.usingComponents[e]=yt(Pt(this.file.relative))+t.usingComponents[e].replace(/^\//,""));return JSON.stringify(t)}),{skipBinary:!1})).pipe(f.restore).pipe(l).pipe(rt.stripCssComments()).pipe(rt.replace(mt,(function(e,t,n){let a="";Pt(this.file.relative);return t+a}),{skipBinary:!1})).pipe(l.restore).pipe(o).pipe(rt.stripCssComments()).pipe(rt.replace(/^[\s\S]*$/,(function(e){if(gt===ft)return e;let t=Pt(this.file.relative);return"@import "+('"'+xt+'/app.wxss";').replace(ht,yt(t))+("\n"+e)}),{skipBinary:!1})).pipe(o.restore).pipe(n.dest(gt,{cwd:ot}))}));const bt=s(),{cwd:jt,env:St,targetPath:_t,subModePath:Lt,regExpWxResources:At,regExpUniImportWxss:Et,wxResourceAlias:Rt,wxResourcePath:Ct}=j,{writeLastLine:Nt,getLevel:Wt,getLevelPath:Mt}=L,{uniRequireWxResource:Jt}=it;n.task("subMode:copyWxResource",(function(){const e=bt.filter([Ct+"/**/*.js"],{restore:!0}),i=bt.filter([Ct+"/**/*.wxss"],{restore:!0});return n.src([Ct+"/**",Ct],{allowEmpty:!0,cwd:jt}).pipe(bt.if("dev"===St,bt.watch([Ct+"/**",Ct,`!/${Ct}/**/*.*___jb_tmp___`],{cwd:jt},(function(e){Nt("处理"+e.relative+"......")})))).pipe(e).pipe(bt.replace(/^/,(function(e){return`require('${Mt(Wt(this.file.relative))}app.js');\n`}),{skipBinary:!1})).pipe(u()).pipe(Jt()).pipe(e.restore).pipe(i).pipe(bt.stripCssComments()).pipe(bt.replace(Et,(function(e,t,n){let a="";Wt(this.file.relative);return t+a}),{skipBinary:!1})).pipe(bt.replace(/^[\s\S]*$/,(function(e){if(Lt===_t)return e;let t=Wt(this.file.relative);return"@import "+('"'+Rt+'/app.wxss";').replace(At,Mt(t))+("\n"+e)}),{skipBinary:!1})).pipe(i.restore).pipe(bt.filter((function(e){if("unlink"===e.event){try{t.sync([e.path.replace(a.resolve(jt,Ct),a.resolve(jt,Lt))],{force:!0})}catch(e){}return!1}return!0}))).pipe(n.dest(Lt,{cwd:jt}))}));const{cwd:qt,env:Bt,targetPath:Ot,subModePath:$t,projectToSubPackageConfig:It,program:Ut}=j,{tryAgain:Ft}=L;n.task("mpWxSubMode",n.series((function(e){console.log("对uni-app进行解耦构建，解除uni-app对原生小程序方法的改写，此过程如果出现权限问题，请使用管理员权限运行"),e()}),"clean:previewDist",(async function e(t){if(Ut.plugin)t();else{try{let e={packPath:(It.subPackagePath?"/":"")+It.subPackagePath,appMode:It.appMode};await p.outputFile($t+"/pack.config.js","module.exports="+JSON.stringify(e,null,4))}catch(n){return void await Ft(async()=>{await e(t)})}t()}}),function(){let e=[async function(e){let t=a.resolve(qt,It.mainWeixinMpPath,"app.js");await p.exists(t)||await p.outputFile(t,"App({});"),e()},"subMode:createUniSubPackage","subMode:copyWxResource",...Ut.plugin?["watch:pluginJson"]:["watch:baseAppJson","watch:pagesJson",...It.mergePack?["watch:mainWeixinMpPackPath"]:[],...$t===Ot?["watch:topMode-mainAppJsAndAppWxss"]:[]],"watch:mainAppJson","watch:mainWeixinMp","watch:projectConfigJson"];return"build"===Bt?n.series.apply(this,e):n.parallel.apply(this,e)}(),(function(e){e(),"build"===Bt&&process.exit()})));const{cwd:Tt,basePath:Dt,base:Ht}=j;n.task("startToPackServe",n.series((async function(e){await p.exists(Dt)||await p.mkdirs(Dt),e()}),"clean:base",(function(e){n.watch(Ht+"/app.json",{events:["all"],cwd:Tt},(function(){e()}))}),"mpWxSubMode")),process.on("unhandledRejection",()=>{});
