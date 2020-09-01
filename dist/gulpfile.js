"use strict";function e(e){return e&&"object"==typeof e&&"default"in e?e.default:e}var t=e(require("del")),n=e(require("gulp")),r=e(require("path")),a=e(require("commander")),s=e(require("single-line-log")),i=e(require("gulp-load-plugins")),p=e(require("vue-template-compiler")),o=e(require("preprocess")),c=e(require("fs-extra")),l=e(require("chokidar")),u=e(require("strip-json-comments")),g=e(require("vinyl")),f=e(require("gulp-strip-comments"));const{program:h}=a;h.option("--scope <type>","运行目录",process.cwd()).option("--plugin","插件模式").option("--type <type>","解耦包类型(哪种小程序)","weixin").option("--native","原生模式"),h.parse(process.argv);const m={weixin:{html:"wxml",css:"wxss",globalObject:"wx",mainMpPath:"mainWeixinMpPath",directivePrefix:"wx:",projectConfig:"project.config.json"},baidu:{html:"swan",css:"css",globalObject:"swan",mainMpPath:"mainBaiduMpPath",directivePrefix:"s-",projectConfig:"project.swan.json"},toutiao:{html:"ttml",css:"ttss",globalObject:"tt",mainMpPath:"mainToutiaoMpPath",directivePrefix:"tt:",projectConfig:"project.config.json"},alipay:{html:"axml",css:"acss",globalObject:"my",mainMpPath:"mainAlipayMpPath",directivePrefix:"a:",projectConfig:"mini.project.json"}},d=m[h.type];if(!d)throw Error("小程序类型错");process.env.PACK_TYPE=h.type;const P=h.scope,y=function(){return require.apply(null,arguments)}(r.resolve(P,"./projectToSubPackageConfig")),v=y.sourceCodePath||"src",b=y.wxResourcePath||`${v}/${d.globalObject}resource`,w=y.wxResourceAlias||"@wxResource",j=RegExp(w+"\\/","g"),k=y.uniRequireApiName||"__uniRequireWx",x=RegExp(k+"\\(([a-zA-Z.\\/\"'@\\d-_]+)\\)","g"),$=y.uniImportWxssApiName||"__uniWxss",S=RegExp(`(}|^|\\s|;)${$}\\s*{([^{}]+)}`,"g"),O=y.projectConfigPath||"";let _="dev";"production"===process.env.NODE_ENV&&(_="build");const E="dist/"+_+"/mp-"+h.type;let C="dist/"+_+`/mp-${h.type}-pack`;h.plugin&&(C="dist/"+_+`/mp-${h.type}-pack-plugin`);var A={pluginProcessFileTypes:y.pluginProcessFileTypes||["js","json","wxml","ttml","ttss","swan","css","html","wxss","htm","wxs","sjs","acss","axml"],currentNamespace:d,program:h,cwd:P,projectToSubPackageConfig:y,wxResourcePath:b,wxResourceAlias:w,regExpWxResources:j,uniRequireApiName:k,regExpUniRequire:x,uniImportWxssApiName:$,regExpUniImportWxss:S,configWxResourceKey:y.configWxResourceKey||"wxResource",env:_,base:E,target:C,basePath:r.resolve(P,E),subModePath:r.resolve(P,C,y.subPackagePath),targetPath:r.resolve(P,C),packIsSubpackage:{mode:!1},mpTypeNamespace:m,sourceCodePath:v,projectConfigPath:O};let N;const R=s.stdout;var M={tryAgain:async function(e){return new Promise(async t=>{setTimeout(async()=>{t(await e())},100)})},getLevelPath:function(e){return Array(e).fill("../").join("")},getLevel:function(e){return e.split(/[\\/]/).length-1},writeLastLine:function(e){R(e),clearTimeout(N),N=setTimeout(()=>{R("解耦构建，正在监听中......(此过程如果出现权限问题，请使用管理员权限运行)")},300)},deepFind:function e(t,n,r,a){n&&(n(t,r,a),t.childNodes?t.childNodes.forEach((t,r,a)=>{e(t,n,r,a)}):t.children&&t.children.forEach((t,r,a)=>{e(t,n,r,a)}))}};const{basePath:T}=A,{tryAgain:L}=M;n.task("clean:base",(async function e(n){try{await t([T+"/**/*"],{force:!0})}catch(t){return void await L(async()=>{await e(n)})}n()}));const{subModePath:B}=A,{tryAgain:q}=M;n.task("clean:subModePath",(async function e(n){try{await t([B+"/**/*"],{force:!0})}catch(t){return void await q(async()=>{await e(n)})}n()}));const{targetPath:F}=A,{tryAgain:J}=M;n.task("clean:previewDist",(async function e(n){try{await t([F+"/**/*"],{force:!0})}catch(t){return void await J(async()=>{await e(n)})}n()}));const{compile:W}=p;var I=class{constructor(e){this.topNode={children:[]},this.init(e)}init(e){this.topNode=W(`<div>${e}</div>`).ast}getAttr(e,t){return e.attrsMap&&e.attrsMap[t]||""}setAttr(e,t,n){if(!e.attrsMap)return"";e.attrsMap[t]=n}render(e=this.topNode.children,t=""){return e.reduce((e,t)=>{if(t.removed)return e;if(1===t.type&&!t.tag)return e;if(3===t.type||2===t.type)return e+=this.writeText(t);const{tag:n,attrsMap:r,children:a=[]}=t;return e+=this.writeOpenTag(n,r),e+=this.render(a),e+=this.writeCloseTag(n)},t)}writeOpenTag(e,t){if(t){const n=Object.keys(t).map(e=>t[e].indexOf('"')>-1&&0>t[e].indexOf("'")?`${e}='${t[e]}'`:`${e}="${t[e]}"`);return`<${e}${n.length>0?" "+n.join(" "):""}>`}return`<${e}>`}writeText(e){return e.text}writeCloseTag(e){return`</${e}>`}};const{currentNamespace:U,mpTypeNamespace:K}=A,{deepFind:D}=M,H=Object.keys(K).map(e=>K[e].directivePrefix),Y=Object.keys(K).map(e=>K[e].html),z=RegExp(`^(${H.join("|")})`),V=RegExp(`\\.(${Y.join("|")})$`,"i");var Z=function(e,t){if(t.relative.match(V)){const t=new I(e);return D(t.topNode,e=>{if(!e.tag||3===e.type)return;const n=t.getAttr(e,"class");"toutiao"===process.env.PACK_TYPE&&n&&!n.match(/(^\s|(\s$))/)&&t.setAttr(e,"class",n+" ");const r=t.getAttr(e,"catchTap");"toutiao"===process.env.PACK_TYPE&&r&&!t.getAttr(e,"bindTap")&&t.setAttr(e,"bindTap",r);const a=t.getAttr(e,"src");e.tag.match(/^(include|import)$/)&&a&&t.setAttr(e,"src",a.replace(V,"."+U.html)),e.attrsMap&&Object.keys(e.attrsMap).forEach(t=>{if(t.match(z)){const n=t.replace(z,U.directivePrefix);e.attrsMap[n]=e.attrsMap[t],n!==t&&delete e.attrsMap[t]}})}),t.render()}return e};const{currentNamespace:G,mpTypeNamespace:Q}=A,X=Object.keys(Q).map(e=>Q[e].css),ee=RegExp(`\\.(${X.join("|")})$`,"i");var te=function(e,{relative:t}){return t.match(ee)&&(e=e.replace(/@import\s*['"](\S+)['"]/g,(function(e,t){return`@import '${t.replace(ee,"."+G.css)}'`}))),e};var ne=function(e,{relative:t}){return"toutiao"===process.env.PACK_TYPE&&t.match(/^\/app\.js$/i)?"\nif (!Promise.prototype.finally) {\n    Promise.prototype.finally = function (callback) {\n        let P = this.constructor;\n        return this.then(\n            value  => P.resolve(callback()).then(() => value),\n            reason => P.resolve(callback()).then(() => { throw reason })\n        );\n    };\n}\n;\n"+e:e};const{preprocess:re}=o;var ae=function(e,{relative:t}){if(t.match(/\.js$/i))try{return re(e,process.env,{type:"js"})}catch(t){return console.log("js条件编译出错"),console.log(t),e}return e};const{currentNamespace:se}=A,{preprocess:ie}=o;var pe=function(e,{relative:t}){if(t.match(RegExp(`.${se.css}$`,"i")))try{return ie(e,process.env,{type:"css"})}catch(t){return console.log(se.css+"条件编译出错"),console.log(t),e}return e};const{currentNamespace:oe}=A,{preprocess:ce}=o;var le=function(e,{relative:t}){if(t.match(RegExp(`.${oe.html}$`,"i")))try{return ce(e,process.env,{type:"html"})}catch(t){return console.log(oe.html+"条件编译出错"),console.log(t),e}return e};const{mpTypeNamespace:ue,currentNamespace:ge}=A,fe=(process,new Set(Object.keys(ue).map(e=>ue[e].globalObject)));var he={mixinsEnvCode:function(e){let t="";return fe.forEach(e=>{ge.globalObject!==e&&(t+=`var ${e} = ${ge.globalObject};\n`)}),t}};const{mixinsEnvCode:me}=he;var de={htmlMixinPlugin:Z,cssMixinPlugin:te,polyfillPlugin:ne,jsPreProcessPlugin:ae,cssPreProcessPlugin:pe,htmlPreProcessPlugin:le,jsMixinPlugin:function(e,{relative:t}){return t.match(/\.js$/i)?me()+e:e}};const{projectToSubPackageConfig:Pe,targetPath:ye}=A,ve=r;(!Pe.plugins||!Pe.plugins instanceof Array)&&(Pe.plugins=[]);var be={runPlugins:function(e){return function(t){const{plugins:n}=Pe;if(n&&!(!n instanceof Array))return n.reduce((t,n)=>{if("string"==typeof n&&(n=de[n]),"function"!=typeof n)return t;const r=ve.resolve(e,this.file.relative),a={relative:r.replace(RegExp("^"+ye.replace(/\\/g,"\\\\")),"").replace(/\\/g,"/"),absolute:r};this.removeAfterAdd=function(e){!function(e){c.existsSync(e)&&c.removeSync(e);const t=l.watch(e);t.on("add",(function(){c.removeSync(e),t.close()}))}(e=e||r)};const s=n.call(this,t,a,de);return null==s?t:s},t)}}};const we=i(),{cwd:je,projectToSubPackageConfig:ke,target:xe,env:$e,pluginProcessFileTypes:Se,sourceCodePath:Oe}=A,{writeLastLine:_e}=M,{runPlugins:Ee}=be;n.task("watch:pluginJson",(function(){const e=we.filter(Se.map(e=>"**/*."+e),{restore:!0});return n.src(Oe+"/plugin.json",{allowEmpty:!0,cwd:je}).pipe(we.if("dev"===$e,we.watch(Oe+"/plugin.json",{cwd:je},(function(e){_e("处理"+e.relative+"......")})))).pipe(e).pipe(we.replace(/[\s\S]*/,Ee(r.resolve(je,xe+"/"+ke.subPackagePath)),{skipBinary:!1})).pipe(e.restore).pipe(n.dest(xe+"/"+ke.subPackagePath,{cwd:je}))}));const Ce=i(),{cwd:Ae,target:Ne,env:Re,targetPath:Me,pluginProcessFileTypes:Te,currentNamespace:Le,projectConfigPath:Be}=A,{writeLastLine:qe}=M,{runPlugins:Fe}=be;n.task("watch:projectConfigJson",(function(){const e=Ce.filter(Te.map(e=>"**/*."+e),{restore:!0});return n.src(`${Be?Be+"/":""}${Le.projectConfig}`,{allowEmpty:!0,cwd:Ae}).pipe(Ce.if("dev"===Re,Ce.watch(`${Be?Be+"/":""}${Le.projectConfig}`,{cwd:Ae},(function(e){qe("处理"+e.relative+"......")})))).pipe(e).pipe(Ce.replace(/[\s\S]*/,Fe(Me),{skipBinary:!1})).pipe(e.restore).pipe(n.dest(Ne,{cwd:Ae}))}));const{runPlugins:Je}=be,{program:We,cwd:Ie,projectToSubPackageConfig:Ue,basePath:Ke,subModePath:De,targetPath:He,packIsSubpackage:Ye,currentNamespace:ze,target:Ve}=A;var Ze=function(){if(We.plugin)return;const e=r.resolve(Ie,Ue[ze.mainMpPath]+"/app.js");if(c.existsSync(e)){const t=c.readFileSync(e,"utf8");let n=`require('${`./${Ue.subPackagePath}/`}app.js');\n`;if(De===He){n=c.readFileSync(Ke+"/app.js","utf8")+";\n"}(Ye.mode||We.plugin)&&(n="");const a=new g({cwd:Ie,base:r.resolve(Ie,Ue[ze.mainMpPath]),path:e});c.outputFileSync(He+"/"+a.relative,Je(r.resolve(Ie,Ve+(We.plugin?"/miniprogram":""))).call({file:a},n+t))}};const Ge=i(),{program:Qe,cwd:Xe,projectToSubPackageConfig:et,configWxResourceKey:tt,base:nt,packIsSubpackage:rt,currentNamespace:at,sourceCodePath:st}=A,{writeLastLine:it}=M;var pt=function(e){return it("处理app.json......"),Ge.replace(/[\s\S]+/,(function(t){if(Qe.plugin&&"mainAppJson"===e)return t;rt.mode=!1;let n,a,s,i={};({pagesJson(){try{n=JSON.parse(u(t))}catch(e){n={}}},baseAppJson(){try{a=JSON.parse(t)}catch(e){a={}}},mainAppJson(){try{s=JSON.parse(t)}catch(e){s={}}}})[e]();try{n||(n=JSON.parse(u(c.readFileSync(r.resolve(Xe,st+"/pages.json"),"utf8"))))}catch(e){n={}}try{a||(a=JSON.parse(c.readFileSync(r.resolve(Xe,nt+"/app.json"),"utf8")))}catch(e){a={}}try{s||(s=JSON.parse(c.readFileSync(r.resolve(Xe,et[at.mainMpPath]+"/app.json"),"utf8")))}catch(e){s={}}function p(e){return et.subPackagePath+(et.subPackagePath?"/":"")+e}if(s.subPackages){let e=s.subPackages.find(e=>e.root===et.subPackagePath);if(e){rt.mode=!0;let t=[...n[tt]&&n[tt].pages||[],...a.pages||[]];return a.subPackages&&a.subPackages.forEach(e=>{t=[...t,...(e.pages||[]).map(t=>e.root+(e.root?"/":"")+t)]}),n[tt]&&n[tt].subPackages&&n[tt].subPackages.forEach(e=>{t=[...t,...(e.pages||[]).map(t=>e.root+(e.root?"/":"")+t)]}),e.pages=t,Ze.call(this),delete a.pages,delete a.subPackages,JSON.stringify({...a,...s},null,2)}}a.pages&&a.pages.forEach((e,t)=>{a.pages[t]=p(e)}),a.subPackages&&a.subPackages.forEach(e=>{e.root=p(e.root)}),n[tt]&&(n[tt].pages&&n[tt].pages.forEach((e,t)=>{n[tt].pages[t]=p(e)}),n[tt].subPackages&&n[tt].subPackages.forEach(e=>{e.root=p(e.root)})),a.tabBar&&a.tabBar.list&&a.tabBar.list.forEach(({pagePath:e,iconPath:t,selectedIconPath:n,...r},s)=>{a.tabBar.list[s]={pagePath:e?p(e):"",iconPath:t?p(t):"",selectedIconPath:n?p(n):"",...r}}),i={...a,...s},i.pages=Array.from(new Set([...n.indexPage?[p(n.indexPage)]:[],...s.pages||[],...a.pages||[],...n[tt]&&n[tt].pages||[]]));let o=[],l={};function g(e){e.forEach(e=>{l[e.root]=l[e.root]?Array.from(new Set([...l[e.root],...e.pages])):e.pages})}g(n[tt]&&n[tt].subPackages||[]),g(a.subPackages||[]),g(s.subPackages||[]);for(let e in l)o.push({root:e,pages:l[e]});if(i.subPackages=[...o],a.usingComponents){for(let e in a.usingComponents)a.usingComponents[e]="/"+et.subPackagePath+a.usingComponents[e];i.usingComponents={...i.usingComponents||{},...a.usingComponents}}return Ze.call(this),"toutiao"===Qe.type&&i.subPackages&&(i.subPackages.forEach(e=>{e.pages.forEach(t=>{i.pages.push((e.root+"/"+t).replace(/\/\//g,"/"))})}),delete i.subPackages),JSON.stringify(i,null,2)}),{skipBinary:!1})};const ot=i(),{cwd:ct,target:lt,env:ut,targetPath:gt,pluginProcessFileTypes:ft,sourceCodePath:ht}=A,{writeLastLine:mt}=M,{runPlugins:dt}=be;n.task("watch:pagesJson",(function(){const e=ot.filter(ft.map(e=>"**/*."+e),{restore:!0});return n.src(ht+"/pages.json",{allowEmpty:!0,cwd:ct}).pipe(ot.if("dev"===ut,ot.watch(ht+"/pages.json",{cwd:ct},(function(e){mt("处理"+e.relative+"......")})))).pipe(pt("pagesJson")).pipe(ot.rename("app.json")).pipe(e).pipe(ot.replace(/[\s\S]*/,dt(gt),{skipBinary:!1})).pipe(e.restore).pipe(n.dest(lt,{cwd:ct}))}));const Pt=i(),{cwd:yt,target:vt,env:bt,base:wt,targetPath:jt,pluginProcessFileTypes:kt}=A,{writeLastLine:xt}=M,{runPlugins:$t}=be;n.task("watch:baseAppJson",(function(){const e=Pt.filter(kt.map(e=>`${wt}/**/*.${e}`),{restore:!0});return n.src(wt+"/app.json",{allowEmpty:!0,cwd:yt}).pipe(Pt.if("dev"===bt,Pt.watch(wt+"/app.json",{cwd:yt},(function(e){xt("处理"+e.relative+"......")})))).pipe(pt("baseAppJson")).pipe(e).pipe(Pt.replace(/[\s\S]*/,$t(jt),{skipBinary:!1})).pipe(e.restore).pipe(n.dest(vt,{cwd:yt}))}));const St=i(),{cwd:Ot,target:_t,env:Et,projectToSubPackageConfig:Ct,program:At,currentNamespace:Nt,pluginProcessFileTypes:Rt}=A,{writeLastLine:Mt}=M,{runPlugins:Tt}=be;n.task("watch:mainAppJson",(function(){const e=Ct[Nt.mainMpPath],t=St.filter(Rt.map(t=>`${e}/**/*.${t}`),{restore:!0});return n.src(e+"/app.json",{allowEmpty:!0,cwd:Ot}).pipe(St.if("dev"===Et,St.watch(e+"/app.json",{cwd:Ot},(function(e){Mt("处理"+e.relative+"......")})))).pipe(pt("mainAppJson")).pipe(t).pipe(St.replace(/[\s\S]*/,Tt(r.resolve(Ot,_t+(At.plugin?"/miniprogram":""))),{skipBinary:!1})).pipe(t.restore).pipe(n.dest(_t+(At.plugin?"/miniprogram":""),{cwd:Ot}))}));const Lt=i(),{cwd:Bt,target:qt,env:Ft,projectToSubPackageConfig:Jt,program:Wt,basePath:It,currentNamespace:Ut,mpTypeNamespace:Kt,pluginProcessFileTypes:Dt}=A,{writeLastLine:Ht}=M,{runPlugins:Yt}=be;n.task("watch:topMode-mainAppJsAndAppWxss",(function(){let e=Jt[Ut.mainMpPath];const t=Object.keys(Kt).map(t=>`${e}/app.${Kt[t].css}`),a=Lt.filter([...t],{restore:!0}),s=Lt.filter([e+"/app.js"],{restore:!0}),i=Lt.filter(Dt.map(t=>`${e}/**/*.${t}`),{restore:!0});return n.src([e+"/app.js",...t],{allowEmpty:!0,cwd:Bt}).pipe(Lt.if("dev"===Ft,Lt.watch([e+"/app.js",`${e}/app.${Ut.css}`],{cwd:Bt},(function(e){Ht("处理"+e.relative+"......")})))).pipe(s).pipe(Lt.replace(/^/,(function(e){return c.readFileSync(It+"/app.js","utf8")+";\n"}),{skipBinary:!1})).pipe(s.restore).pipe(a).pipe(Lt.replace(/^/,(function(e){return c.readFileSync(`${It}/app.${Ut.css}`,"utf8")+"\n"}),{skipBinary:!1})).pipe(Lt.rename((function(e){e.extname="."+Ut.css}))).pipe(a.restore).pipe(i).pipe(Lt.replace(/[\s\S]*/,Yt(r.resolve(Bt,qt+(Wt.plugin?"/miniprogram":""))),{skipBinary:!1})).pipe(i.restore).pipe(n.dest(qt+(Wt.plugin?"/miniprogram":""),{cwd:Bt}))}));const zt=i(),{cwd:Vt,target:Zt,env:Gt,projectToSubPackageConfig:Qt,base:Xt,wxResourcePath:en,currentNamespace:tn,mpTypeNamespace:nn,pluginProcessFileTypes:rn}=A,{writeLastLine:an}=M,{runPlugins:sn}=be;n.task("watch:mainWeixinMpPackPath",(function(){const e=Qt[tn.mainMpPath],a=e+"/"+Qt.subPackagePath,s=Zt+"/"+Qt.subPackagePath,i=[],p=[],o=new Set,l=new Set;Object.keys(nn).forEach(e=>{i.push(`${a}/**/*.${nn[e].css}`),p.push(`${a}/**/*.${nn[e].html}`),o.add("."+nn[e].css),l.add("."+nn[e].html)});const u=zt.filter([...p],{restore:!0}),g=zt.filter([...i],{restore:!0}),f=(zt.filter([a+"/**/*.js"],{restore:!0}),zt.filter(rn.map(e=>`${a}/**/*.${e}`),{restore:!0}));return n.src([a,a+"/**/*","!"+a+"/pack.config.js"],{allowEmpty:!0,cwd:Vt}).pipe(zt.if("dev"===Gt,zt.watch([a,a+"/**/*","!/"+a+"/pack.config.js"],{cwd:Vt},(function(e){an("处理"+e.relative+"......")})))).pipe(zt.filter((function(n){if(n.relative!==tn.projectConfig&&!function(e){const t=Qt[tn.mainMpPath]+"/"+Qt.subPackagePath;return c.existsSync(e.path.replace(r.resolve(Vt,t),r.resolve(Vt,Xt)))?["ext.json",tn.projectConfig].indexOf(e.relative)>-1&&Qt.mergePack&&""===Qt.subPackagePath:!c.existsSync(e.path.replace(r.resolve(Vt,t),r.resolve(Vt,en)))}(n))return!1;if("unlink"===n.event){try{let a=n.path;const s=RegExp(n.extname+"$","i");o.has(n.extname)&&(a=a.replace(s,"."+tn.css)),l.has(n.extname)&&(a=a.replace(s,"."+tn.html)),t.sync([a.replace(r.resolve(Vt,e),r.resolve(Vt,Zt))],{force:!0})}catch(e){}return!1}return!0}))).pipe(u).pipe(zt.rename((function(e){e.extname="."+tn.html}))).pipe(u.restore).pipe(g).pipe(zt.rename((function(e){e.extname="."+tn.css}))).pipe(g.restore).pipe(f).pipe(zt.replace(/[\s\S]*/,sn(r.resolve(Vt,s)),{skipBinary:!1})).pipe(f.restore).pipe(n.dest(s,{cwd:Vt}))}));const pn=i(),{cwd:on,target:cn,env:ln,projectToSubPackageConfig:un,basePath:gn,subModePath:fn,targetPath:hn,program:mn,packIsSubpackage:dn,currentNamespace:Pn,mpTypeNamespace:yn,pluginProcessFileTypes:vn}=A,{writeLastLine:bn}=M,{runPlugins:wn}=be;n.task("watch:mainWeixinMp",(function(){const e=un[Pn.mainMpPath],a=e+"/"+un.subPackagePath,s=[],i=[],p=new Set,o=new Set;Object.keys(yn).forEach(t=>{s.push(`${e}/**/*.${yn[t].css}`),i.push(`${e}/**/*.${yn[t].html}`),p.add("."+yn[t].css),o.add("."+yn[t].html)});const c=pn.filter([e+"/app.js"],{restore:!0}),l=(pn.filter([e+"/**/*.js"],{restore:!0}),pn.filter([...i],{restore:!0})),u=pn.filter([...s],{restore:!0}),g=pn.filter(vn.map(t=>`${e}/**/*.${t}`),{restore:!0});return n.src([e+"/**/*","!"+e+"/app.json","!"+e+"/**/*.json___jb_tmp___","!"+e+`/**/*.${Pn.html}___jb_tmp___`,"!"+e+`/**/*.${Pn.css}___jb_tmp___`,"!"+e+"/**/*.js___jb_tmp___","!"+a+"/**/*"],{base:r.resolve(on,e),allowEmpty:!0,cwd:on}).pipe(pn.if("dev"===ln,pn.watch([e+"/**/*","!/"+e+"/app.json","!/"+a+"/**/*"],{cwd:on},(function(e){e.relative.match(/.json/),bn("处理"+e.relative+"......")})))).pipe(pn.filter((function(n){if("unlink"===n.event){try{let a=n.path;const s=RegExp(n.extname+"$","i");p.has(n.extname)&&(a=a.replace(s,"."+Pn.css)),o.has(n.extname)&&(a=a.replace(s,"."+Pn.html)),t.sync([a.replace(r.resolve(on,e),r.resolve(on,cn))],{force:!0})}catch(e){}return!1}return!0}))).pipe(c).pipe(pn.replace(/[\s\S]*/,(function(e){if(dn.mode||mn.plugin)return e;let t=`./${un.subPackagePath}/`;if(fn===hn){const t=fs.readFileSync(gn+"/app.js","utf8");return e.match(RegExp(t.replace(/\./g,"\\.").replace(/\(/g,"\\(").replace(/\)/g,"\\)")))?e:`${t};\n${e}`}return e.match(RegExp(`require\\('${t.replace(/\./g,"\\.")}app.js'\\)`))?e:`require('${t}app.js');\n${e}`}),{skipBinary:!1})).pipe(c.restore).pipe(l).pipe(pn.rename((function(e){e.extname="."+Pn.html}))).pipe(l.restore).pipe(u).pipe(pn.rename((function(e){e.extname="."+Pn.css}))).pipe(u.restore).pipe(g).pipe(pn.replace(/[\s\S]*/,wn(r.resolve(on,cn+(mn.plugin?"/miniprogram":""))),{skipBinary:!1})).pipe(g.restore).pipe(n.dest(cn+(mn.plugin?"/miniprogram":""),{cwd:on}))}));var jn={fakeUniBootstrap:function(e,t,n,r){globalObject.__uniapp2wxpack||(globalObject.__uniapp2wxpack={platform:r}),globalObject.onAppHide&&globalObject.onAppShow||(n="none",console.warn("uniapp2wxpack warn: ide不支持appMode设为relegation和top，所以转为none")),"relegation"!==n||globalObject.onAppRoute||(n="top",console.warn("uniapp2wxpack warn: ide不支持appMode设为relegation，但是支持top，所以转为top"));var a=globalObject.__uniapp2wxpack[t.replace("/","")]={__packInit:{}};if(e)for(var s in e)"function"!=typeof e[s]?a.__packInit[s]=e[s]:function(t){a.__packInit[t]=function(){return e[t].apply(e,arguments)}}(s);else e={};if("none"!==n){var i=Page,p=Component,o="",c=1,l=1;"function"==typeof e.onError&&globalObject.onError&&globalObject.onError((function(){return e.onError.apply(e,arguments)})),"function"==typeof e.onPageNotFound&&globalObject.onPageNotFound&&globalObject.onPageNotFound((function(){return e.onPageNotFound.apply(e,arguments)})),"function"==typeof e.onUnhandledRejection&&globalObject.onUnhandledRejection&&globalObject.onUnhandledRejection((function(){return e.onUnhandledRejection.apply(e,arguments)})),globalObject.onAppRoute&&globalObject.onAppRoute((function(r){"top"!==n&&0!==("/"+r.path).indexOf(t+"/")&&(c=1,e.onHide.call(e,globalObject.getLaunchOptionsSync())),o=r.path})),globalObject.onAppHide((function(r){if("top"===n)return globalObject.getLaunchOptionsSync?e.onHide.call(e,globalObject.getLaunchOptionsSync()):e.onHide.call(e,r);var a=getCurrentPages();return 0===("/"+(null==a[a.length-1].route?a[a.length-1].__route__:a[a.length-1].route)).indexOf(t+"/")?(c=1,o="",e.onHide.call(e,globalObject.getLaunchOptionsSync())):void 0})),globalObject.onAppShow((function(t){if(l&&(getApp()&&(getApp().globalData||(getApp().globalData={}),Object.assign(getApp().globalData,e.globalData||{})),l=0),"top"===n&&"function"==typeof e.onShow)return globalObject.getLaunchOptionsSync?e.onShow.call(e,globalObject.getLaunchOptionsSync()):e.onShow.call(e,t)})),"top"===n&&l&&"function"==typeof e.onLaunch&&globalObject.getLaunchOptionsSync&&e.onLaunch.call(e,globalObject.getLaunchOptionsSync()),Page=function(e){return u(e),i.call(this,e)},Component=function(e){return u(e.methods||{}),p.call(this,e)}}function u(r){if("top"!==n){var a=r.onShow;"function"!=typeof e.onShow&&"function"!=typeof e.onLaunch||(r.onShow=function(){var n=getCurrentPages(),r=null==n[n.length-1].route?n[n.length-1].__route__:n[n.length-1].route;if(o&&0===("/"+o).indexOf(t+"/")||0!==("/"+r).indexOf(t+"/")||(c&&(c=0,e.onLaunch.call(e,globalObject.getLaunchOptionsSync())),e.onShow.call(e,globalObject.getLaunchOptionsSync())),"function"==typeof a)return a.apply(this,arguments)})}}},fakeUniBootstrapName:"fakeUniBootstrap"};const kn=i(),{regExpWxResources:xn,regExpUniRequire:$n}=A,{getLevelPath:Sn,getLevel:On}=M;var _n={uniRequireWxResource:function(){return kn.replace(/[\s\S]*/,(function(e,t){const n=["var __uniPackNativeRequireInject={};\n"],r=On(this.file.relative);return e=e.replace($n,(e,t)=>{console.log(`\n编译${e}--\x3erequire(${t.replace(xn,Sn(r))})`);const a=t.replace(xn,Sn(r)),s=`__uniPackNativeRequireInject[${a}] = require(${a});\n`;return 0>n.indexOf(s)&&n.push(s),`__uniPackNativeRequireInject[${a}]`}),n[1]?`${n.join("")} ${e}`:e}),{skipBinary:!1})}};const{currentNamespace:En,regExpWxResources:Cn,wxResourceAlias:An}=A,{getLevelPath:Nn,getLevel:Rn}=M;var Mn=function(e,t){const n=Rn(t);return"@import "+`"${An}/common/main.${En.css}";`.replace(Cn,Nn(n))+("\n"+e)};const Tn=i(),{fakeUniBootstrapName:Ln,fakeUniBootstrap:Bn}=jn,{cwd:qn,env:Fn,program:Jn,basePath:Wn,targetPath:In,subModePath:Un,base:Kn,regExpUniRequire:Dn,regExpWxResources:Hn,regExpUniImportWxss:Yn,currentNamespace:zn,mpTypeNamespace:Vn,pluginProcessFileTypes:Zn,sourceCodePath:Gn,projectToSubPackageConfig:Qn}=A,Xn=process.env.PACK_TYPE,{writeLastLine:er,getLevel:tr,getLevelPath:nr,deepFind:rr}=M,{uniRequireWxResource:ar}=_n,{runPlugins:sr}=be,ir=Object.keys(Vn).map(e=>Vn[e].css),pr=new Set(ir);n.task("subMode:createUniSubPackage",(function(){c.mkdirsSync(Wn);const e=Tn.filter(Kn+"/**/*.js",{restore:!0}),a=Tn.filter([Kn+"/common/vendor.js"],{restore:!0}),s=Tn.filter([Kn+"/common/main.js"],{restore:!0}),i=Tn.filter(Zn.map(e=>`${Kn}/**/*.${e}`),{restore:!0}),p=Tn.filter([Kn+"/**/*.js","!"+Kn+"/app.js","!"+Kn+"/common/vendor.js","!"+Kn+"/common/main.js","!"+Kn+"/common/runtime.js"],{restore:!0}),o=Tn.filter([`${Kn}/**/*.${zn.css}`,`!${Kn}/app.${zn.css}`,`!${Kn}/common/main.${zn.css}`],{restore:!0}),l=Tn.filter([`${Kn}/**/*.${zn.css}`,`!${Kn}/app.${zn.css}`],{restore:!0}),u=Tn.filter([Kn+"/**/*.json"],{restore:!0}),g=Tn.filter([`${Kn}/**/*.${zn.html}`],{restore:!0});return n.src([Kn+"/**","!"+Kn+"/app.json",Kn+"/app.js",`${Kn}/app.${zn.css}`],{allowEmpty:!0,cwd:qn}).pipe(Tn.if("dev"===Fn,Tn.watch([Kn+"/**/*","!/"+Kn+"/app.json"],{cwd:qn},(function(e){er("处理"+e.relative+"......")})))).pipe(Tn.filter((function(e){if(function(e){const t=r.resolve(In,"app.js"),n=r.resolve(In,"app."+zn.css),a=e.path.replace(Wn,Un);return t===a||n===a}(e))return!1;if(function(e){if(0>["ext.json",zn.projectConfig].indexOf(e.relative))return!1;if(Qn.mergePack&&""===Qn.subPackagePath){if(c.existsSync(r.resolve(qn,Qn[zn.mainMpPath],e.relative)))return!0}return!1}(e))return!1;if("unlink"===e.event){try{let n=e.path;const a=RegExp(e.extname+"$","i");pr.has(e.extname.substr(1))&&(n=n.replace(a,"."+zn.css)),t.sync([n.replace(Wn,r.resolve(qn,Un))],{force:!0})}catch(e){}return!1}return!0}))).pipe(g).pipe(Tn.replace(/[\s\S]*/,(function(e){const t=this.file.path.replace(RegExp(zn.html+"$","i"),zn.css),n=this.file.relative.replace(RegExp(zn.html+"$","i"),zn.css);c.existsSync(t)||c.outputFileSync(r.resolve(qn,Un,n),Mn("",n));const a=new I(e);let s=0;return rr(a.topNode,e=>{if(1===e.type&&"wxs"===e.tag&&1===e.children.length&&3===e.children[0].type){e.children[0].text.replace(Dn,(t,n,r,a)=>{const i=tr(this.file.relative),p=n.replace(Hn,nr(i)).replace(/['"]/g,"");e.attrsMap.src=p,e.children=[],s=1,console.log(`\n编译${t}--\x3erequire(${p})`)})}}),s?a.render():e}),{skipBinary:!1})).pipe(g.restore).pipe(a).pipe(Tn.replace(/^/,(function(e){return Jn.plugin?`var App=function(packInit){};${zn.globalObject}.canIUse=function(){return false};`:`var __packConfig=require('../pack.config.js');var App=function(packInit){var ${Ln}=${(""+Bn).replace(/globalObject/g,zn.globalObject)};${Ln}(packInit,__packConfig.packPath,__packConfig.appMode,'${Xn}');};`}),{skipBinary:!1})).pipe(a.restore).pipe(e).pipe(f()).pipe(ar()).pipe(e.restore).pipe(s).pipe(Tn.replace(/^/,(function(e){return"var __uniPluginExports={};\n"}),{skipBinary:!1})).pipe(Tn.replace(/$/,(function(e){return"\nmodule.exports=__uniPluginExports;"}),{skipBinary:!1})).pipe(s.restore).pipe(p).pipe(Tn.replace(/^/,(function(e){if(c.existsSync(r.resolve(qn,Gn,this.file.relative)))return e;return`require('${nr(tr(this.file.relative))}app.js');\n`}),{skipBinary:!1})).pipe(p.restore).pipe(u).pipe(Tn.replace(/[\s\S]*/,(function(e){if(!c.existsSync(r.resolve(qn,Gn,this.file.relative.replace(/json$/,"vue")))&&!c.existsSync(r.resolve(qn,Gn,this.file.relative.replace(/json$/,"nvue"))))return e;let t=JSON.parse(""+this.file.contents);for(let e in t.usingComponents)0===t.usingComponents[e].indexOf("/")&&(t.usingComponents[e]=nr(tr(this.file.relative))+t.usingComponents[e].replace(/^\//,""));return JSON.stringify(t)}),{skipBinary:!1})).pipe(u.restore).pipe(l).pipe(Tn.stripCssComments()).pipe(Tn.replace(Yn,(function(e,t,n){let r="",a=tr(this.file.relative);return(n+=";").replace(/\s*import\s*:\s*(('[^\s';]*')|("[^\s";]*"))/g,(function(e,t){const n=RegExp(`(${ir.join("|")})(['"])$`);t=t.replace(n,zn.css+"$2"),r+=`@import ${t.replace(Hn,nr(a))};\n`})),t+r}),{skipBinary:!1})).pipe(l.restore).pipe(o).pipe(Tn.stripCssComments()).pipe(Tn.replace(/^[\s\S]*$/,(function(e){return Un===In?e:Mn(e,this.file.relative)}),{skipBinary:!1})).pipe(o.restore).pipe(i).pipe(Tn.replace(/[\s\S]*/,sr(Un),{skipBinary:!1})).pipe(i.restore).pipe(n.dest(Un,{cwd:qn}))}));const or=i(),{cwd:cr,env:lr,targetPath:ur,subModePath:gr,regExpWxResources:fr,regExpUniImportWxss:hr,wxResourcePath:mr,currentNamespace:dr,mpTypeNamespace:Pr,pluginProcessFileTypes:yr}=A,{writeLastLine:vr,getLevel:br,getLevelPath:wr}=M,{uniRequireWxResource:jr}=_n,{runPlugins:kr}=be,xr=[],$r=[],Sr=[],Or=new Set,_r=new Set;Object.keys(Pr).forEach(e=>{xr.push(Pr[e].css),$r.push(`${mr}/**/*.${Pr[e].css}`),Sr.push(`${mr}/**/*.${Pr[e].html}`),Or.add("."+Pr[e].css),_r.add("."+Pr[e].html)}),n.task("subMode:copyWxResource",(function(){const e=or.filter([mr+"/**/*.js"],{restore:!0}),a=or.filter([...$r],{restore:!0}),s=or.filter([...Sr],{restore:!0}),i=or.filter(yr.map(e=>`${mr}/**/*${e}`),{restore:!0});return n.src([mr+"/**",mr],{allowEmpty:!0,cwd:cr}).pipe(or.if("dev"===lr,or.watch([mr+"/**",mr,`!/${mr}/**/*.*___jb_tmp___`],{cwd:cr},(function(e){vr("处理"+e.relative+"......")})))).pipe(e).pipe(or.replace(/^/,(function(e){return`require('${wr(br(this.file.relative))}app.js');\n`}),{skipBinary:!1})).pipe(f()).pipe(jr()).pipe(e.restore).pipe(a).pipe(or.stripCssComments()).pipe(or.replace(hr,(function(e,t,n){let r="";br(this.file.relative);return t+r}),{skipBinary:!1})).pipe(or.replace(/^[\s\S]*$/,(function(e){return gr===ur?e:Mn(e,this.file.relative)}),{skipBinary:!1})).pipe(or.rename((function(e){e.extname="."+dr.css}))).pipe(a.restore).pipe(s).pipe(or.rename((function(e){e.extname="."+dr.html}))).pipe(s.restore).pipe(or.filter((function(e){if("unlink"===e.event){try{let n=e.path;const a=RegExp(e.extname+"$","i");Or.has(e.extname)&&(n=n.replace(a,"."+dr.css)),_r.has(e.extname)&&(n=n.replace(a,"."+dr.html)),t.sync([n.replace(r.resolve(cr,mr),r.resolve(cr,gr))],{force:!0})}catch(e){}return!1}return!0}))).pipe(i).pipe(or.replace(/[\s\S]*/,kr(gr),{skipBinary:!1})).pipe(i.restore).pipe(n.dest(gr,{cwd:cr}))}));const Er=i(),{cwd:Cr,target:Ar,env:Nr,projectToSubPackageConfig:Rr,currentNamespace:Mr,mpTypeNamespace:Tr,pluginProcessFileTypes:Lr}=A,{writeLastLine:Br}=M,{runPlugins:qr}=be;n.task("watch:native",(function(){const e=Rr[Mr.mainMpPath],a=[],s=[],i=new Set,p=new Set;Object.keys(Tr).forEach(t=>{a.push(`${e}/**/*.${Tr[t].css}`),s.push(`${e}/**/*.${Tr[t].html}`),i.add("."+Tr[t].css),p.add("."+Tr[t].html)});Er.filter([e+"/**/*.js"],{restore:!0});const o=Er.filter([...s],{restore:!0}),c=Er.filter([...a],{restore:!0}),l=Er.filter(Lr.map(t=>`${e}/**/*.${t}`),{restore:!0});return n.src([e+"/**/*","!"+e+"/app.json"],{base:r.resolve(Cr,e),allowEmpty:!0,cwd:Cr}).pipe(Er.if("dev"===Nr,Er.watch([e+"/**/*","!/"+e+"/app.json"],{cwd:Cr},(function(e){Br("处理"+e.relative+"......")})))).pipe(Er.filter((function(n){if("unlink"===n.event){try{let a=n.path;const s=RegExp(n.extname+"$","i");i.has(n.extname)&&(a=a.replace(s,"."+Mr.css)),p.has(n.extname)&&(a=a.replace(s,"."+Mr.html)),t.sync([a.replace(r.resolve(Cr,e),r.resolve(Cr,Ar))],{force:!0})}catch(e){console.log(e)}return!1}return!0}))).pipe(o).pipe(Er.rename((function(e){e.extname="."+Mr.html}))).pipe(o.restore).pipe(c).pipe(Er.rename((function(e){e.extname="."+Mr.css}))).pipe(c.restore).pipe(l).pipe(Er.replace(/[\s\S]*/,qr(r.resolve(Cr,Ar)),{skipBinary:!1})).pipe(l.restore).pipe(n.dest(Ar,{cwd:Cr}))}));const{cwd:Fr,env:Jr,targetPath:Wr,subModePath:Ir,projectToSubPackageConfig:Ur,program:Kr,currentNamespace:Dr}=A,{tryAgain:Hr}=M;async function Yr(e){let t=r.resolve(Fr,Ur[Dr.mainMpPath],"app.js");await c.exists(t)||await c.outputFile(t,"App({});"),e()}n.task("mpWxSubMode",n.series((function(e){console.log("小程序解耦构建开启，此过程如果出现权限问题，请使用管理员权限运行"),e()}),"clean:previewDist",(async function e(t){if(Kr.plugin||Kr.native)t();else{try{let e={packPath:(Ur.subPackagePath?"/":"")+Ur.subPackagePath,appMode:Ur.appMode};await c.outputFile(Ir+"/pack.config.js","module.exports="+JSON.stringify(e,null,4))}catch(n){return void await Hr(async()=>{await e(t)})}t()}}),function(){let e=[Yr,"subMode:createUniSubPackage","subMode:copyWxResource",...Kr.plugin?["watch:pluginJson"]:["watch:baseAppJson","watch:pagesJson",...Ur.mergePack?["watch:mainWeixinMpPackPath"]:[],...Ir===Wr?["watch:topMode-mainAppJsAndAppWxss"]:[]],"watch:mainAppJson","watch:mainWeixinMp","watch:projectConfigJson"];return Kr.native&&(e=[Yr,"watch:mainAppJson","watch:native"]),"build"===Jr?n.series.apply(this,e):n.parallel.apply(this,e)}(),(function(e){e(),"build"===Jr&&process.exit()})));const{cwd:zr,basePath:Vr,base:Zr,program:Gr}=A;n.task("startToPackServe",n.series((async function(e){Gr.native||await c.exists(Vr)||await c.mkdirs(Vr),e()}),"clean:base",(function(e){Gr.native?e():n.watch(Zr+"/app.json",{events:["all"],cwd:zr},(function(){e()}))}),"mpWxSubMode")),process.on("unhandledRejection",()=>{});
