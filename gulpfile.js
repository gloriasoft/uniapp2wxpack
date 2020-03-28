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
    const readline = require('readline');
    const { program } = require('commander');
    program
        .option('--scope <type>','运行目录',process.cwd())
    program.parse(process.argv);
    const cwd = program.scope
    const projectToSubPackageConfig = require(path.resolve(cwd,'./projectToSubPackageConfig'))

    process.on('unhandledRejection', (reason, p) => {
        return
        // console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
        // application specific logging, throwing an error, or other logic here
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
    function writeLastLine(val) {
        // readline.clearLine(process.stdout);
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(val);
        clearTimeout(writeTimer)
        writeTimer=setTimeout(()=>{
            readline.clearLine(process.stdout);
            readline.cursorTo(process.stdout, 0);
            process.stdout.write('解耦构建，正在监听中......(此过程如果出现权限问题，请使用管理员权限运行)');
        },1000)
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
                    config=JSON.parse(stripJsonComments(fs.readFileSync(path.resolve(cwd,'src/pages.json'))))
                }
            }catch(e){
                config={}
            }
            try{
                if(!appJson){
                    appJson=JSON.parse(fs.readFileSync(path.resolve(cwd,base+'/app.json')))
                }
            }catch(e){
                appJson={}
            }
            try{
                if(!mainJson){
                    mainJson=JSON.parse(fs.readFileSync(path.resolve(cwd,projectToSubPackageConfig.mainWeixinMpPath+'/app.json')))
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
                    ...(config.indexPage ? [addSubPackagePath(config.indexPage)] : []),
                    ...mainJson.pages || [],
                    ...appJson.pages || [],
                    ...config.wxResource && config.wxResource.pages || []
                ]
            ))

            // merge subPackages
            targetJson.subPackages=[
                ...config.wxResource && config.wxResource.subPackages || [],
                ...appJson.subPackages || [],
                ...mainJson.subPackages || []
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
                writeLastLine('处理'+event.path+'......')
            })))
            .pipe(mergeToTargetJson('pagesJson'))
            .pipe($.rename('app.json'))
            .pipe(gulp.dest(target,{cwd}))
    })

    gulp.task('watch:baseAppJson',function(){
        return gulp.src(base+'/app.json',{allowEmpty:true,cwd})
            .pipe($.if(env==='dev',$.watch(base+'/app.json',{cwd},function(event){
                // console.log('处理'+event.path)
                writeLastLine('处理'+event.path+'......')
            })))
            .pipe(mergeToTargetJson('baseAppJson'))
            .pipe(gulp.dest(target,{cwd}))
    })

    gulp.task('watch:mainAppJson',function(){
        let base=projectToSubPackageConfig.mainWeixinMpPath
        return gulp.src(base+'/app.json',{allowEmpty:true,cwd})
            .pipe($.if(env==='dev',$.watch(base+'/app.json',{cwd},function(event){
                // console.log('处理'+event.path)
                writeLastLine('处理'+event.path+'......')
            })))
            .pipe(mergeToTargetJson('mainAppJson'))
            .pipe(gulp.dest(target,{cwd}))
    })

    gulp.task('watch:mainWeixinMp',function(){
        let base=projectToSubPackageConfig.mainWeixinMpPath
        let basePackPath=base+'/'+projectToSubPackageConfig.subPackagePath
        return gulp.src([base+'/**/*','!'+base+'/app.json','!'+base+'/**/*.json___jb_tmp___','!'+base+'/**/*.wxml___jb_tmp___','!'+base+'/**/*.wxss___jb_tmp___','!'+base+'/**/*.js___jb_tmp___','!'+basePackPath+'/**/*'],{base:path.resolve(cwd,base), allowEmpty: true,cwd})
            .pipe($.if(env==='dev',$.watch([base+'/**/*','!/'+base+'/app.json','!/'+basePackPath+'/**/*'],{cwd},function(event){
                // console.log('处理'+event.path)w
                writeLastLine('处理'+event.path+'......')
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
            .pipe(gulp.dest(target,{cwd}));
    })


    gulp.task('subMode:createUniSubPackage',async function(done){
        await (fs.mkdirs(basePath))
        let f=$.filter([base+'/common/vendor.js',base+'/common/main.js',base+'/common/runtime.js',base+'/pages/**/*.js'],{restore:true})
        let filterVendor=$.filter([base+'/common/vendor.js'],{restore:true})
        let filterJs=$.filter([base+'/**/*.js','!'+base+'/common/vendor.js','!'+base+'/common/main.js','!'+base+'/common/runtime.js'],{restore:true})
        let filterWxss=$.filter([base+'/**/*.wxss'],{restore:true})
        let filterJson=$.filter([base+'/**/*.json'],{restore:true})
        // let filterWxml=$.filter([base+'/**/*.wxml'],{restore:true})
        return gulp.src([base+'/**',base,'!'+base+'/*.*'],{allowEmpty:true,cwd})
            .pipe($.if(env==='dev',$.watch([base+'/**',base,'!/'+base+'/*.*'],{cwd},function(event){
                // console.log('处理'+event.path)
                writeLastLine('处理'+event.path+'......')
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
            .pipe($.replace(/^/,'let App=function(){};',{
                skipBinary:false
            }))
            .pipe(filterVendor.restore)
            .pipe(f)
            .pipe(strip())
            .pipe(uniRequireWxResource())
            .pipe(f.restore)
            .pipe(filterJs)
            .pipe($.replace(/^/,function(match){
                if(fs.existsSync('./src/'+this.file.relative)){
                    return match
                }
                let packagePath=getLevelPath(getLevel(this.file.relative))
                return `
                require('${packagePath}common/runtime.js');
                require('${packagePath}common/vendor.js');
                require('${packagePath}common/main.js');
                `
            },{
                skipBinary:false
            }))
            .pipe(filterJs.restore)
            .pipe(filterJson)
            .pipe($.replace(/[\s\S]*/,function(match){
                if(!fs.existsSync('./src/'+this.file.relative.replace(/json$/,'vue')) && !fs.existsSync('./src/'+this.file.relative.replace(/json$/,'nvue'))){
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
            .pipe(filterWxss)
            .pipe($.replace(/(}|^|\s)__uniWxss\s*{([^{}]+)}/g,function(match,p1,p2){
                let str=''
                let pathLevel=getLevel(this.file.relative)
                ;(p2+';').replace(/\s*import\s*:\s*([^\s]*;)/g,function(match,p1){
                    str+=`@import ${p1.replace(/@wxResource\//g,getLevelPath(pathLevel))}`
                })
                return p1+str
            },{
                skipBinary:false
            }))
            .pipe($.replace(/^[\s\S]*$/,function(match){
                let pathLevel=getLevel(this.file.relative)
                let mainWxss=`@import ${'"@wxResource/common/main.wxss";'.replace(/@wxResource\//g,getLevelPath(pathLevel))}`
                let result=`\n${match}`
                if(!this.file.relative.match(/^common[\\/]+main.wxss/i)){
                    result=mainWxss+result
                }
                return result
            },{
                skipBinary:false
            }))
            .pipe(filterWxss.restore)
            .pipe(gulp.dest(subModePath,{cwd}))
    })

    gulp.task('subMode:copyWxResource',function(){
        let filterJs=$.filter(['src/wxresource/**/*.js'],{restore:true})
        return gulp.src(['src/wxresource/**','src/wxresource'],{allowEmpty: true,cwd})
            .pipe($.if(env === 'dev',$.watch(['src/wxresource/**','src/wxresource','!src/wxresource/**/*.*___jb_tmp___'],{cwd},function(event){
                // console.log('处理'+event.path)
                writeLastLine('处理'+event.path+'......')
            })))
            .pipe(filterJs)
            .pipe(strip())
            .pipe(uniRequireWxResource())
            .pipe(filterJs.restore)
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
        let tasks=['subMode:createUniSubPackage','subMode:copyWxResource','watch:baseAppJson','watch:pagesJson','watch:mainAppJson','watch:mainWeixinMp']
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
                await fs.outputFile(subModePath+'/pack.config.js', `module.exports={packPath:'/${projectToSubPackageConfig.subPackagePath}'}`)
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
