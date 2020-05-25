const fs = require('fs-extra')
const $ = require('gulp-load-plugins')()
const path = require('path')
const stripJsonComments = require('strip-json-comments')
const {
    program,
    cwd,
    projectToSubPackageConfig,
    configWxResourceKey,
    base,
    packIsSubpackage
} = require('./preset')
const {writeLastLine} = require('./utils')
const forceUpdateAppJs = require('./forceUpdateAppJs')
function mergeToTargetJson (type) {
    // console.log('处理app.json')
    writeLastLine('处理app.json......')
    return $.replace(/[\s\S]+/, function(match){
        if (program.plugin && type === 'mainAppJson') return match

        packIsSubpackage.mode = false

        let config, appJson, mainJson, targetJson = {}
        let typeMap = {
            pagesJson () {
                try {
                    config = JSON.parse(stripJsonComments(match))
                } catch (e) {
                    config = {}
                }
            },
            baseAppJson () {
                try {
                    appJson = JSON.parse(match)
                } catch (e) {
                    appJson = {}
                }
            },
            mainAppJson () {
                try {
                    mainJson=JSON.parse(match)
                } catch (e) {
                    mainJson = {}
                }
            }
        }
        typeMap[type]()
        try {
            if (!config) {
                config = JSON.parse(stripJsonComments(fs.readFileSync(path.resolve(cwd, 'src/pages.json'), 'utf8')))
            }
        } catch (e) {
            config = {}
        }
        try {
            if (!appJson) {
                appJson = JSON.parse(fs.readFileSync(path.resolve(cwd, base+'/app.json'), 'utf8'))
            }
        } catch (e) {
            appJson = {}
        }
        try {
            if (!mainJson) {
                mainJson = JSON.parse(fs.readFileSync(path.resolve(cwd, projectToSubPackageConfig.mainWeixinMpPath + '/app.json'), 'utf8'))
            }
        } catch (e) {
            mainJson = {}
        }

        // 处理subpackage路径拼接
        function addSubPackagePath (pagePath) {
            return projectToSubPackageConfig.subPackagePath + (projectToSubPackageConfig.subPackagePath ? '/' : '') + pagePath
        }

        // 判断主小程序的AppJson中是否把uni项目设为了分包
        if (mainJson.subPackages) {
            let pack = mainJson.subPackages.find((pack) => {
                return pack.root === projectToSubPackageConfig.subPackagePath
            })
            if (pack) {
                packIsSubpackage.mode = true
                // 要将uni项目里所有的pages和subPackages里的pages合并到主小程序uni分布设置的subPackages的pages里
                let tempAppSubPackgages = [
                    // pages直接使用
                    ...config[configWxResourceKey] && config[configWxResourceKey].pages || [],
                    ...appJson.pages || []
                ]
                // 处理subPackages
                if (appJson.subPackages) {
                    appJson.subPackages.forEach((pack) => {
                        tempAppSubPackgages = [
                            ...tempAppSubPackgages,
                            // 拼接上root
                            ...(pack.pages || []).map((page) => {
                                return pack.root + (pack.root ? '/' : '') + page
                            })
                        ]
                    })
                }
                //处理
                if (config[configWxResourceKey] && config[configWxResourceKey].subPackages) {
                    config[configWxResourceKey].subPackages.forEach((pack) => {
                        tempAppSubPackgages = [
                            ...tempAppSubPackgages,
                            // 拼接上root
                            ...(pack.pages || []).map((page) => {
                                return pack.root + (pack.root ? '/' : '') + page
                            })
                        ]
                    })
                }
                pack.pages = tempAppSubPackgages
                forceUpdateAppJs()
                // 删除pages和subPackages之后合并其他的属性
                delete appJson.pages
                delete appJson.subPackages
                return JSON.stringify({
                    ...appJson,
                    ...mainJson
                }, null, 2)
            }
        }

        if (appJson.pages) {
            appJson.pages.forEach((pagePath, index) => {
                appJson.pages[index] = addSubPackagePath(pagePath)
            })
        }

        if (appJson.subPackages) {
            appJson.subPackages.forEach((subPackage) => {
                subPackage.root = addSubPackagePath(subPackage.root)
            })
        }

        if (config[configWxResourceKey]) {
            if (config[configWxResourceKey].pages) {
                config[configWxResourceKey].pages.forEach((pagePath, index) => {
                    config[configWxResourceKey].pages[index] = addSubPackagePath(pagePath)
                })
            }

            if (config[configWxResourceKey].subPackages) {
                config[configWxResourceKey].subPackages.forEach((subPackage) => {
                    subPackage.root = addSubPackagePath(subPackage.root)
                })
            }
        }

        // tabBar
        if (appJson.tabBar && appJson.tabBar.list) {
            appJson.tabBar.list.forEach(({pagePath, iconPath, selectedIconPath, ...others}, index) => {
                appJson.tabBar.list[index] = {
                    pagePath: pagePath ? addSubPackagePath(pagePath) : '',
                    iconPath: iconPath ? addSubPackagePath(iconPath) : '',
                    selectedIconPath: selectedIconPath ? addSubPackagePath(selectedIconPath) : '',
                    ...others
                }
            })
        }

        // merge all first
        targetJson = {
            ...appJson,
            ...mainJson
        }

        // merge pages
        targetJson.pages = Array.from(new Set([
                ...config.indexPage ? [addSubPackagePath(config.indexPage)] : [],
                ...mainJson.pages || [],
                ...appJson.pages || [],
                ...config[configWxResourceKey] && config[configWxResourceKey].pages || []
            ]
        ))

        // check subPackages from config & appJson
        let uniSubPackages = [], uniSubPackagesMap = {}
        function checkValidSubPackages(subPackages) {
            subPackages.forEach((sub) => {
                if (!uniSubPackagesMap[sub.root]) {
                    uniSubPackagesMap[sub.root] = sub.pages
                } else {
                    // 去重
                    uniSubPackagesMap[sub.root] = Array.from(new Set([
                        ...uniSubPackagesMap[sub.root],
                        ...sub.pages
                    ]))
                }
            })
        }

        // wxResource和基础输出的app.json中的subPackages进行合并
        checkValidSubPackages(config[configWxResourceKey] && config[configWxResourceKey].subPackages || [])
        checkValidSubPackages(appJson.subPackages || [])
        checkValidSubPackages(mainJson.subPackages || [])

        for (let i in uniSubPackagesMap) {
            uniSubPackages.push({
                root: i,
                pages: uniSubPackagesMap[i]
            })
        }

        // merge subPackages
        targetJson.subPackages = [
            ...uniSubPackages
        ]

        // usingComponents
        if (appJson.usingComponents) {
            for (let i in appJson.usingComponents) {
                appJson.usingComponents[i] = '/' + projectToSubPackageConfig.subPackagePath + appJson.usingComponents[i]
            }
            targetJson.usingComponents = {
                ...targetJson.usingComponents || {},
                ...appJson.usingComponents
            }
        }

        forceUpdateAppJs()
        return JSON.stringify(targetJson, null, 2)
    }, {
        skipBinary:false
    })
}

module.exports = mergeToTargetJson
