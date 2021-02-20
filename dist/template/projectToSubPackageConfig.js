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
        'setLibrary', // 修改webpack依赖队列的对象名，用于避免webpack加载冲突，代替webpack的library配置
    ]
}
