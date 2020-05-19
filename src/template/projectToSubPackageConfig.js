module.exports={
    // 微信原生小程序目录
    mainWeixinMpPath: 'mainWeixinMp',
    // uni项目输出的分包在微信原生小程序中的路径
    subPackagePath: 'uniSubpackage',
    // uni项目的App.vue中初始设置的处理方式，默认是relegation(降级模式)，[top(顶级模式) / none(丢弃)]
    appMode: 'relegation',
    // 如果微信原生小程序目录中的目录名称合uni项目输出的目录名相同，是否融合处理，默认不融合处理，直接忽略原生小程序里的目录，merge以uni项目优先
    mergePack: false
}
