/*
* 作者devilwjp（天堂里的花大咩）
* 2019年7月
* 解决的问题：一切不能输出分包的小程序开发框架，都是耍流氓！
* 思路：在uni-app打包完之后，再进行一次打包，再次打包不可使用webpack，使用gulp进行文件流级别的处理，解除uni对于app.js的依赖，以及解除对Page和Component的劫持
* 由于是解耦包，所以不会在app.js中留存任何uni的痕迹，可做到整个uni项目不依赖于主包运行
*
* 对uni-app在微信小程序的打包方案进行改造，形成解耦打包，并且支持微信原生页面直接在uni-app项目中使用
* 1.可以使项目输出微信小程序的分包，被其他小程序项目使用
* 2.支持微信原生页面直接在uni-app项目中使用（还支持任何原生的js、wxss在uni-app项目中使用）
* 3.支持原生小程序项目直接在uni-app项目中进行开发，当uni-app的解耦包是主包时，uni-app包可以通过globalData进行方法公开，被原生小程序的其他页面和分包使用
* 4.支持uni-app项目调用原生小程序项目中的资源
*
* */
(function(){
    const gulp = require('gulp')
    const del=require('del')
    const $ = require('gulp-load-plugins')()
    const path= require('path')
    const fs = require('fs-extra')
    const stripJsonComments = require('strip-json-comments')
    // const rfr = require('read-file-relative').readSync
    const strip = require('gulp-strip-comments')
    // const readline = require('readline');
    const log = require('single-line-log').stdout;
    const { program } = require('commander');
    program
        .option('--scope <type>','运行目录',process.cwd())
    program.parse(process.argv);
    const cwd = program.scope
    const projectToSubPackageConfig = require(path.resolve(cwd,'./projectToSubPackageConfig'))

    process.on('unhandledRejection', (reason, p) => {
        return
    });

    let env='dev'
    if(process.env.NODE_ENV === 'production'){
        env='build'
    }

    const base='dist/'+env+'/mp-weixin'
    const target='dist/'+env+'/mp-weixin-pack'
    const basePath=path.resolve(cwd,base)
    const subModePath = path.resolve(cwd, target, projectToSubPackageConfig.subPackagePath)
    const targetPath = path.resolve(cwd,target)
    let writeTimer
    let packIsSubpackage

    // 静态方法，会被通过toString转换成字符串，直接es5
    function fakeUniBootstrap(vueInit,packPath,appMode){
        if(!wx.__uniapp2wxpack)wx.__uniapp2wxpack={};
        var packObject=wx.__uniapp2wxpack[packPath.replace('/','')]={
            '__packInit':{}
        };
        if(vueInit){
            for(var initProp in vueInit){
                if(typeof vueInit[initProp] === 'function'){
                    (function(initProp){
                        packObject.__packInit[initProp]=function(){
                            return vueInit[initProp].apply(vueInit, arguments);
                        }
                    })(initProp);
                    continue;
                }
                packObject.__packInit[initProp]=vueInit[initProp];
            }
        }else{
            vueInit={}
        }

        if(appMode==='none'){
            return
        }
        var oldPage = Page, oldComponent = Component;
        var lastPath='',first=1,topFirst=1;
        if(typeof vueInit.onError === 'function'){
            wx.onError(function(){
                return vueInit.onError.apply(vueInit,arguments)
            });
        }
        if(typeof vueInit.onPageNotFound === 'function'){
            wx.onPageNotFound(function(){
                return vueInit.onPageNotFound.apply(vueInit,arguments)
            })
        }
        if(typeof vueInit.onUnhandledRejection === 'function'){
            wx.onUnhandledRejection(function(){
                return vueInit.onUnhandledRejection.apply(vueInit,arguments)
            })
        }

        wx.onAppRoute(function(options){
            if(appMode!=='top'){
                if(('/'+options.path).indexOf(packPath+'/')!==0){
                    first=1;
                    vueInit.onHide.call(vueInit, wx.getLaunchOptionsSync())
                }
            }
            lastPath=options.path;
        })
        wx.onAppHide(function(){
            if(appMode==='top'){
                return vueInit.onHide.call(vueInit, wx.getLaunchOptionsSync())
            }else{
                var pages=getCurrentPages()
                if(('/'+pages[pages.length-1].route).indexOf(packPath+'/')===0){
                    first=1;
                    lastPath=''
                    return vueInit.onHide.call(vueInit, wx.getLaunchOptionsSync())
                }
            }
        })

        wx.onAppShow(function(){
            if(appMode==='top' && typeof vueInit.onShow === 'function'){
                vueInit.onShow.call(vueInit, wx.getLaunchOptionsSync());
            }
            if(topFirst){
                if(getApp()){
                    if(!getApp().globalData){
                        getApp().globalData={}
                    }
                    Object.assign(getApp().globalData,vueInit.globalData || {})
                }
            }
            topFirst=0;
        })

        if(appMode==='top' && topFirst && typeof vueInit.onLaunch === 'function'){
            vueInit.onLaunch.call(vueInit, wx.getLaunchOptionsSync());
        }

        function intercept(params){
            if(appMode==='top')return
            var onShow = params.onShow;
            if(typeof vueInit.onShow === 'function' || typeof vueInit.onLaunch === 'function'){
                params.onShow = function(){
                    var pages=getCurrentPages()
                    if((!lastPath || ('/'+lastPath).indexOf(packPath+'/')!==0) && ('/'+pages[pages.length-1].route).indexOf(packPath+'/')===0){
                        if(first){
                            first=0;
                            vueInit.onLaunch.call(vueInit,wx.getLaunchOptionsSync());
                        }
                        vueInit.onShow.call(vueInit,wx.getLaunchOptionsSync());
                    }

                    if(typeof onShow === 'function'){
                        return onShow.apply(this,arguments);
                    }
                }
            }
        }
        Page = function(params){
            intercept(params);
            return oldPage.call(this,params);
        }

        Component = function(params){
            intercept(params.methods||{});
            return oldComponent.call(this,params);
        }
    }
    fakeUniBootstrap.name='fakeUniBootstrap'

    function writeLastLine(val) {
        log(val)
        clearTimeout(writeTimer)
        writeTimer=setTimeout(()=>{
            log('解耦构建，正在监听中......(此过程如果出现权限问题，请使用管理员权限运行)')
        },300)
    }

    async function tryAgain(awaitDone){
        return new Promise(async (resolve)=>{
            setTimeout(async ()=>{
                resolve(await awaitDone())
            },100)
        })
    }

    function getLevelPath(level){
        let arr=Array(level)
        return arr.fill('../').join('')
    }
    function getLevel(relative){
        return relative.split(/[\\/]/).length-1
    }

    function uniRequireWxResource(){
        return $.replace(/__uniRequireWx\(([a-zA-Z.\/"'@\d]+)\)/g,function(match, p1, offset, string){
            let pathLevel=getLevel(this.file.relative)
            console.log(`\n编译${match}-->require(${p1.replace(/@wxResource\//g,getLevelPath(pathLevel))})`)
            return `require(${p1.replace(/@wxResource\//g,getLevelPath(pathLevel))})`
        },{
            skipBinary:false
        })
    }

    function mergeToTargetJson(type){
        // console.log('处理app.json')
        writeLastLine('处理app.json......')
        return $.replace(/[\s\S]+/,function(match){
            let config, appJson, mainJson, targetJson={}
            let typeMap={
                pagesJson(){
                    try{
                        config=JSON.parse(stripJsonComments(match))
                    }catch(e){
                        config={}
                    }

                },
                baseAppJson(){
                    try{
                        appJson=JSON.parse(match)
                    }catch(e){
                        appJson={}
                    }
                },
                mainAppJson(){
                    try{
                        mainJson=JSON.parse(match)
                    }catch(e){
                        mainJson={}
                    }
                }
            }
            typeMap[type]()
            try{
                if(!config){
                    config=JSON.parse(stripJsonComments(fs.readFileSync(path.resolve(cwd,'src/pages.json'),'utf8')))
                }
            }catch(e){
                config={}
            }
            try{
                if(!appJson){
                    appJson=JSON.parse(fs.readFileSync(path.resolve(cwd,base+'/app.json'),'utf8'))
                }
            }catch(e){
                appJson={}
            }
            try{
                if(!mainJson){
                    mainJson=JSON.parse(fs.readFileSync(path.resolve(cwd,projectToSubPackageConfig.mainWeixinMpPath+'/app.json'),'utf8'))
                }
            }catch(e){
                mainJson={}
            }

            // 处理subpackage路径拼接
            function addSubPackagePath(pagePath){
                return projectToSubPackageConfig.subPackagePath+'/'+pagePath
            }

            // 判断主小程序的AppJson中是否把uni项目设为了分包
            if(mainJson.subPackages){
                let pack=mainJson.subPackages.find((pack)=>{
                    return pack.root === projectToSubPackageConfig.subPackagePath
                })
                if(pack){
                    packIsSubpackage = true
                    // 要将uni项目里所有的pages和subPackages里的pages合并到主小程序uni分布设置的subPackages的pages里
                    let tempAppSubPackgages=[
                        // pages直接使用
                        ...config.wxResource && config.wxResource.pages || [],
                        ...appJson.pages||[]
                    ]
                    // 处理subPackages
                    if(appJson.subPackages){
                        appJson.subPackages.forEach((pack)=>{
                            tempAppSubPackgages=[
                                ...tempAppSubPackgages,
                                // 拼接上root
                                ...(pack.pages||[]).map((page)=>{
                                    return pack.root+'/'+page
                                })
                            ]
                        })
                    }
                    //处理
                    if(config.wxResource && config.wxResource.subPackages){
                        config.wxResource.subPackages.forEach((pack)=>{
                            tempAppSubPackgages=[
                                ...tempAppSubPackgages,
                                // 拼接上root
                                ...(pack.pages||[]).map((page)=>{
                                    return pack.root+'/'+page
                                })
                            ]
                        })
                    }
                    pack.pages=tempAppSubPackgages

                    // 删除pages和subPackages之后合并其他的属性
                    delete appJson.pages
                    delete appJson.subPackages
                    return JSON.stringify({
                        ...appJson,
                        ...mainJson
                    },null,2)
                }
            }

            if(appJson.pages){
                appJson.pages.forEach((pagePath, index)=>{
                    appJson.pages[index]=addSubPackagePath(pagePath)
                })
            }

            if(appJson.subPackages){
                appJson.subPackages.forEach((subPackage)=>{
                    subPackage.root=addSubPackagePath(subPackage.root)
                })
            }

            if(config.wxResource){
                if(config.wxResource.pages){
                    config.wxResource.pages.forEach((pagePath, index)=>{
                        config.wxResource.pages[index]=addSubPackagePath(pagePath)
                    })
                }

                if(config.wxResource.subPackages){
                    config.wxResource.subPackages.forEach((subPackage)=>{
                        subPackage.root=addSubPackagePath(subPackage.root)
                    })
                }
            }

            // tabBar
            if(appJson.tabBar && appJson.tabBar.list){
                appJson.tabBar.list.forEach(({pagePath, iconPath, selectedIconPath, ...others}, index)=>{
                    appJson.tabBar.list[index]={
                        pagePath: pagePath ? addSubPackagePath(pagePath) : '',
                        iconPath: iconPath ? addSubPackagePath(iconPath) : '',
                        selectedIconPath: selectedIconPath ? addSubPackagePath(selectedIconPath) : '',
                        ...others
                    }
                })
            }

            // merge all first
            targetJson= {
                ...appJson,
                ...mainJson
            }

            // merge pages
            targetJson.pages=Array.from(new Set([
                    ...config.indexPage ? [addSubPackagePath(config.indexPage)] : [],
                    ...mainJson.pages || [],
                    ...appJson.pages || [],
                    ...config.wxResource && config.wxResource.pages || []
                ]
            ))

            // check subPackages from config & appJson
            let uniSubPackages=[], uniSubPackagesMap={}
            function checkValidSubPackages(subPackages){
                subPackages.forEach((sub)=>{
                    if(!uniSubPackagesMap[sub.root]){
                        uniSubPackagesMap[sub.root]=sub.pages
                    }else{
                        // 去重
                        uniSubPackagesMap[sub.root]=Array.from(new Set([
                            ...uniSubPackagesMap[sub.root],
                            ...sub.pages
                        ]))
                    }
                })
            }

            // wxResource和基础输出的app.json中的subPackages进行合并
            checkValidSubPackages(config.wxResource && config.wxResource.subPackages || [])
            checkValidSubPackages(appJson.subPackages || [])
            checkValidSubPackages(mainJson.subPackages || [])

            for(let i in uniSubPackagesMap){
                uniSubPackages.push({
                    root: i,
                    pages: uniSubPackagesMap[i]
                })
            }

            // merge subPackages
            targetJson.subPackages=[
                ...uniSubPackages
            ]

            // usingComponents
            if(appJson.usingComponents){
                for(let i in appJson.usingComponents){
                    appJson.usingComponents[i] = '/' + projectToSubPackageConfig.subPackagePath + appJson.usingComponents[i]
                }
                targetJson.usingComponents={
                    ...targetJson.usingComponents || {},
                    ...appJson.usingComponents
                }
            }
            return JSON.stringify(targetJson, null, 2)
        },{
            skipBinary:false
        })
    }

    gulp.task('clean:base',async function f(done){
        try{
            await del([basePath+'/**/*'],{force:true})
        }catch(e){
            await tryAgain(async ()=>{
               await f(done)
            })
            return
        }
        done()
    });

    gulp.task('clean:subModePath',async function f(done){
        try{
            await del([subModePath+'/**/*'],{force:true})
        }catch(e){
            await tryAgain(async ()=>{
                await f(done)
            })
            return
        }
        done()
    });

    gulp.task('clean:previewDist',async function f(done){
        try{
            await del([targetPath+'/**/*'],{force:true})
        }catch(e){
            await tryAgain(async ()=>{
                await f(done)
            })
            return
        }
        done()
    });

    gulp.task('watch:pagesJson',function(){
        return gulp.src('src/pages.json',{allowEmpty:true,cwd})
            .pipe($.if(env==='dev',$.watch('src/pages.json',{cwd},function(event){
                // console.log('处理'+event.path)
                writeLastLine('处理'+event.relative+'......')
            })))
            .pipe(mergeToTargetJson('pagesJson'))
            .pipe($.rename('app.json'))
            .pipe(gulp.dest(target,{cwd}))
    })

    gulp.task('watch:baseAppJson',function(){
        return gulp.src(base+'/app.json',{allowEmpty:true,cwd})
            .pipe($.if(env==='dev',$.watch(base+'/app.json',{cwd},function(event){
                // console.log('处理'+event.path)
                writeLastLine('处理'+event.relative+'......')
            })))
            .pipe(mergeToTargetJson('baseAppJson'))
            .pipe(gulp.dest(target,{cwd}))
    })

    gulp.task('watch:mainAppJson',function(){
        let base=projectToSubPackageConfig.mainWeixinMpPath
        return gulp.src(base+'/app.json',{allowEmpty:true,cwd})
            .pipe($.if(env==='dev',$.watch(base+'/app.json',{cwd},function(event){
                // console.log('处理'+event.path)
                writeLastLine('处理'+event.relative+'......')
            })))
            .pipe(mergeToTargetJson('mainAppJson'))
            .pipe(gulp.dest(target,{cwd}))
    })

    gulp.task('watch:mainWeixinMp',function(){
        let base=projectToSubPackageConfig.mainWeixinMpPath
        let basePackPath=base+'/'+projectToSubPackageConfig.subPackagePath
        let filterAppJs=$.filter([base+'/app.js'],{restore:true})
        return gulp.src([base+'/**/*','!'+base+'/app.json','!'+base+'/**/*.json___jb_tmp___','!'+base+'/**/*.wxml___jb_tmp___','!'+base+'/**/*.wxss___jb_tmp___','!'+base+'/**/*.js___jb_tmp___','!'+basePackPath+'/**/*'],{base:path.resolve(cwd,base), allowEmpty: true,cwd})
            .pipe($.if(env==='dev',$.watch([base+'/**/*','!/'+base+'/app.json','!/'+basePackPath+'/**/*'],{cwd},function(event){
                // console.log('处理'+event.path)w
                writeLastLine('处理'+event.relative+'......')
            })))
            .pipe($.filter(async function(file){
                if(file.event === 'unlink'){
                    try{
                        await del([file.path.replace(path.resolve(cwd,base),path.resolve(cwd,target))],{force:true})
                    }catch(e){}
                    return false
                }else{
                    return true
                }
            }))
            .pipe(filterAppJs)
            .pipe($.replace(/^/,function(match){
                if (!packIsSubpackage) return ''
                let packagePath=`./${projectToSubPackageConfig.subPackagePath}/`
                return `require('${packagePath}app.js');\n`
            },{
                skipBinary:false
            }))
            .pipe(filterAppJs.restore)
            .pipe(gulp.dest(target,{cwd}));
    })


    gulp.task('subMode:createUniSubPackage', function(){
        fs.mkdirsSync(basePath)
        let f=$.filter([base+'/common/vendor.js',base+'/common/main.js',base+'/common/runtime.js',base+'/pages/**/*.js'],{restore:true})
        let filterVendor=$.filter([base+'/common/vendor.js'],{restore:true})
        let filterJs=$.filter([base+'/**/*.js','!'+base+'/app.js','!'+base+'/common/vendor.js','!'+base+'/common/main.js','!'+base+'/common/runtime.js'],{restore:true})
        let filterWxss=$.filter([base+'/**/*.wxss','!'+base+'/app.wxss','!'+base+'/common/main.wxss'],{restore:true})
        let filterWxssIncludeMain = $.filter([base+'/**/*.wxss','!'+base+'/app.wxss'],{restore:true})
        let filterJson=$.filter([base+'/**/*.json'],{restore:true})
        // let filterWxml=$.filter([base+'/**/*.wxml'],{restore:true})
        return gulp.src([base+'/**','!'+base+'/*.*',base+'/app.js',base+'/app.wxss'],{allowEmpty:true,cwd})
            .pipe($.if(env==='dev',$.watch([base+'/**/*','!/'+base+'/*.json',],{cwd},function(event){
                // console.log('处理'+event.path)
                writeLastLine('处理'+event.relative+'......')
            })))
            .pipe($.filter(async function(file){
                if(file.event === 'unlink'){
                    try{
                        await del([file.path.replace(basePath,path.resolve(cwd,subModePath))],{force:true})
                    }catch(e){}
                    return false
                }else{
                    return true
                }
            }))
            .pipe(filterVendor)
            // .pipe($.replace(/([^;}{,\s=.]+).createApp\s*=\s*([^;}{,\s=.]+)/g,function(match,p1,p2){
            //     if(p1!=='wx'){
            //         return `${p1}.createApp=(function(){if(typeof ${p2}==='function'){return function(){if(!__app){__app=arguments[0]}return ${p2}.apply(this,arguments)}}else{return ${p2}}})()`
            //     }
            //     return match
            // },{
            //     skipBinary:false
            // }))
            .pipe($.replace(/^/,`var __packConfig=require('../pack.config.js');var App=function(packInit){${fakeUniBootstrap.toString()};${fakeUniBootstrap.name}(packInit,__packConfig.packPath,__packConfig.appMode);};`,{
                skipBinary:false
            }))
            .pipe(filterVendor.restore)
            .pipe(f)
            .pipe(strip())
            .pipe(uniRequireWxResource())
            .pipe(f.restore)
            .pipe(filterJs)
            .pipe($.replace(/^/,function(match){
                if(fs.existsSync(path.resolve(cwd,'src',this.file.relative))){
                    return match
                }
                let packagePath=getLevelPath(getLevel(this.file.relative))
                return `require('${packagePath}app.js');\n`
            },{
                skipBinary:false
            }))
            .pipe(filterJs.restore)
            .pipe(filterJson)
            .pipe($.replace(/[\s\S]*/,function(match){
                if(!fs.existsSync(path.resolve(cwd,'src',this.file.relative.replace(/json$/,'vue'))) && !fs.existsSync(path.resolve(cwd,'src',this.file.relative.replace(/json$/,'nvue')))){
                    return match
                }
                let json=JSON.parse(this.file.contents.toString())
                for(let i in json.usingComponents){
                    if(json.usingComponents[i].indexOf('/')===0){
                        json.usingComponents[i]=getLevelPath(getLevel(this.file.relative))+json.usingComponents[i].replace(/^\//,'')
                    }
                }
                return JSON.stringify(json)
            },{
                skipBinary:false
            }))
            .pipe(filterJson.restore)
            .pipe(filterWxssIncludeMain)
            .pipe($.stripCssComments())
            .pipe($.replace(/(}|^|\s|;)__uniWxss\s*{([^{}]+)}/g,function(match,p1,p2){
                let str=''
                let pathLevel=getLevel(this.file.relative)
                ;(p2+';').replace(/\s*import\s*:\s*(('[^\s';]*')|("[^\s";]*"))/g,function(match,p1){
                    str+=`@import ${p1.replace(/@wxResource\//g,getLevelPath(pathLevel))};\n`
                })
                return p1+str
            },{
                skipBinary:false
            }))
            .pipe(filterWxssIncludeMain.restore)
            .pipe(filterWxss)
            .pipe($.stripCssComments())
            .pipe($.replace(/^[\s\S]*$/,function(match){
                let pathLevel=getLevel(this.file.relative)
                let mainWxss=`@import ${'"@wxResource/app.wxss";'.replace(/@wxResource\//g,getLevelPath(pathLevel))}`
                let result=`\n${match}`
                return mainWxss+result
            },{
                skipBinary:false
            }))
            .pipe(filterWxss.restore)
            .pipe(gulp.dest(subModePath,{cwd}))
    })

    gulp.task('subMode:copyWxResource',function(){
        let filterJs=$.filter(['src/wxresource/**/*.js'],{restore:true})
        let filterWxss=$.filter(['src/wxresource/**/*.wxss'],{restore:true})
        return gulp.src(['src/wxresource/**','src/wxresource'],{allowEmpty: true,cwd})
            .pipe($.if(env === 'dev',$.watch(['src/wxresource/**','src/wxresource','!/src/wxresource/**/*.*___jb_tmp___'],{cwd},function(event){
                // console.log('处理'+event.path)
                writeLastLine('处理'+event.relative+'......')
            })))
            .pipe(filterJs)
            .pipe($.replace(/^/,function(match){
                let packagePath=getLevelPath(getLevel(this.file.relative))
                return `require('${packagePath}app.js');\n`
            },{
                skipBinary:false
            }))
            .pipe(strip())
            .pipe(uniRequireWxResource())
            .pipe(filterJs.restore)
            .pipe(filterWxss)
            .pipe($.stripCssComments())
            .pipe($.replace(/(}|^|\s|;)__uniWxss\s*{([^{}]+)}/g,function(match,p1,p2){
                let str=''
                let pathLevel=getLevel(this.file.relative)
                ;(p2+';').replace(/\s*import\s*:\s*(('[^\s']*')|("[^\s']*"))/g,function(match,p1){
                    str+=`@import ${p1.replace(/@wxResource\//g,getLevelPath(pathLevel))};\n`
                })
                return p1+str
            },{
                skipBinary:false
            }))
            .pipe($.replace(/^[\s\S]*$/,function(match){
                let pathLevel=getLevel(this.file.relative)
                let mainWxss=`@import ${'"@wxResource/app.wxss";'.replace(/@wxResource\//g,getLevelPath(pathLevel))}`
                let result=`\n${match}`
                return mainWxss+result
            },{
                skipBinary:false
            }))
            .pipe(filterWxss.restore)
            .pipe($.filter(async function(file){
                if(file.event === 'unlink'){
                    try{
                        await del([file.path.replace(path.resolve(cwd,'src/wxresource'),path.resolve(cwd,subModePath))],{force:true})
                    }catch(e){}
                    return false
                }else{
                    return true
                }
            }))
            .pipe(gulp.dest(subModePath,{cwd}));
    })

    function buildProcess(){
        let tasks=[async function(done){
            // 判断主小程序目录有没有app.js
            let mainAppJsPath = path.resolve(cwd,projectToSubPackageConfig.mainWeixinMpPath,'app.js')
            if(!(await (fs.exists(mainAppJsPath)))){
                await (fs.outputFile(mainAppJsPath, 'App({});'))
            }
            done()
        },'subMode:createUniSubPackage', 'subMode:copyWxResource','watch:baseAppJson','watch:pagesJson','watch:mainAppJson','watch:mainWeixinMp'
        ]
        if(env === 'build'){
            // 同步处理
            return gulp.series.apply(this,tasks)
        }else{
            // 异步处理
            return gulp.parallel.apply(this,tasks)
        }
    }

    gulp.task('mpWxSubMode',gulp.series(function(done){
            console.log('对uni-app进行解耦构建，解除uni-app对原生小程序方法的改写，此过程如果出现权限问题，请使用管理员权限运行')
            done()
        },'clean:previewDist',
// 创建pack.config.js
        async function f(done){
            try{
                let packConfig = {
                    packPath: '/'+projectToSubPackageConfig.subPackagePath,
                    appMode: projectToSubPackageConfig.appMode
                }
                await fs.outputFile(subModePath+'/pack.config.js', `module.exports=${JSON.stringify(packConfig,null,4)}`)
            }catch(e){
                await tryAgain(async ()=>{
                    await f(done)
                })
                return
            }
            done()
        },
        buildProcess(),
        function(done){
            done()
            if(env === 'build'){
                process.exit()
            }
        }))

    gulp.task('startToPackServe',gulp.series(
    // 初始化
    async function(done){
        if(!(await (fs.exists(basePath)))){
            await (fs.mkdirs(basePath))
        }
        done()
    },'clean:base',
    // 通过判断普通uni构建目录的app.json来识别是否完成了uni的第一次构建
    function(done){
        // 使用原生的watch是为了只监听一次
        gulp.watch(base+'/app.json',{events:['all'],cwd}, function(){
            done()
        })
    },'mpWxSubMode'))
})()
