const gulp = require('gulp')
const path =require('path')
const fs = require('fs-extra')
const {
    cwd,
    env,
    targetPath,
    subModePath,
    projectToSubPackageConfig,
    program,
    currentNamespace
} = require('../preset')
const {tryAgain} = require('../utils')

async function checkMainAppTask (done) {
    // 判断主小程序目录有没有app.js
    let mainAppJsPath = path.resolve(cwd, projectToSubPackageConfig[currentNamespace.mainMpPath], 'app.js')
    if (!(await (fs.exists(mainAppJsPath)))) {
        await (fs.outputFile(mainAppJsPath, 'App({});'))
    }
    done()
}

function buildProcess(){
    let tasks = [
        checkMainAppTask, 'subMode:createUniSubPackage', 'subMode:copyWxResource',
        ...(program.plugin ?
                ['watch:pluginJson'] :
                ['watch:baseAppJson', 'watch:pagesJson',
                    ...(projectToSubPackageConfig.mergePack ?
                            ['watch:mainWeixinMpPackPath'] :
                            []
                    ),
                    ...(subModePath === targetPath ?
                            ['watch:topMode-mainAppJsAndAppWxss'] :
                            []
                    )
                ]
        ),
        'watch:mainAppJson', 'watch:mainWeixinMp', 'watch:projectConfigJson'
    ]

    // 纯原生模式
    if (program.native) {
        tasks = [
            checkMainAppTask,
            'watch:mainAppJson',
            'watch:native'
        ]
    }

    if(env === 'build'){
        // 同步处理
        return gulp.series.apply(this,tasks)
    }else{
        // 异步处理
        return gulp.parallel.apply(this,tasks)
    }
}

gulp.task('mpWxSubMode', gulp.series(function (done) {
    console.log('小程序解耦构建开启，此过程如果出现权限问题，请使用管理员权限运行')
    done()
}, 'clean:previewDist',
// 创建pack.config.js
async function f (done) {
    if (program.plugin || program.native) {
        done()
        return
    }
    try {
        let packConfig = {
            packPath: (projectToSubPackageConfig.subPackagePath ? '/' : '') + projectToSubPackageConfig.subPackagePath,
            appMode: projectToSubPackageConfig.appMode
        }
        await fs.outputFile(subModePath+'/pack.config.js', `module.exports=${JSON.stringify(packConfig, null, 4)}`)
    } catch (e) {
        await tryAgain(async ()=>{
            await f(done)
        })
        return
    }
    done()
},
buildProcess(),
function (done) {
    done()
    if(env === 'build'){
        process.exit()
    }
}))
