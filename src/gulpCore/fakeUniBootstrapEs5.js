// 静态方法，会被通过toString转换成字符串，直接es5
function fakeUniBootstrap (vueInit, packPath , appMode) {
    if(!wx.__uniapp2wxpack) {
        wx.__uniapp2wxpack = {}
    }
    var packObject = wx.__uniapp2wxpack[packPath.replace('/', '')] = {
        '__packInit': {}
    };
    if (vueInit) {
        for (var initProp in vueInit) {
            if (typeof vueInit[initProp] === 'function') {
                (function(initProp) {
                    packObject.__packInit[initProp] = function () {
                        return vueInit[initProp].apply(vueInit, arguments);
                    }
                }) (initProp);
                continue;
            }
            packObject.__packInit[initProp] = vueInit[initProp];
        }
    } else {
        vueInit = {}
    }

    if (appMode === 'none') {
        return
    }
    var oldPage = Page, oldComponent = Component;
    var lastPath='', first = 1, topFirst = 1;
    if (typeof vueInit.onError === 'function') {
        wx.onError(function () {
            return vueInit.onError.apply(vueInit, arguments)
        });
    }
    if (typeof vueInit.onPageNotFound === 'function') {
        wx.onPageNotFound (function () {
            return vueInit.onPageNotFound.apply(vueInit, arguments)
        })
    }
    if (typeof vueInit.onUnhandledRejection === 'function'){
        wx.onUnhandledRejection(function () {
            return vueInit.onUnhandledRejection.apply(vueInit, arguments)
        })
    }

    wx.onAppRoute(function (options) {
        if (appMode !== 'top') {
            if(('/' + options.path).indexOf(packPath + '/') !== 0){
                first = 1;
                vueInit.onHide.call(vueInit, wx.getLaunchOptionsSync())
            }
        }
        lastPath = options.path;
    })
    wx.onAppHide(function () {
        if (appMode === 'top') {
            return vueInit.onHide.call(vueInit, wx.getLaunchOptionsSync())
        } else {
            var pages = getCurrentPages()
            if (('/'+pages[pages.length-1].route).indexOf(packPath+'/') === 0) {
                first = 1;
                lastPath = ''
                return vueInit.onHide.call(vueInit, wx.getLaunchOptionsSync())
            }
        }
    })

    wx.onAppShow(function () {
        if (appMode === 'top' && typeof vueInit.onShow === 'function') {
            vueInit.onShow.call(vueInit, wx.getLaunchOptionsSync());
        }
        if (topFirst) {
            if (getApp()) {
                if (!getApp().globalData) {
                    getApp().globalData = {}
                }
                Object.assign(getApp().globalData,vueInit.globalData || {})
            }
        }
        topFirst = 0;
    })

    if (appMode==='top' && topFirst && typeof vueInit.onLaunch === 'function') {
        vueInit.onLaunch.call(vueInit, wx.getLaunchOptionsSync());
    }

    function intercept (params) {
        if (appMode === 'top') return
        var onShow = params.onShow;
        if (typeof vueInit.onShow === 'function' || typeof vueInit.onLaunch === 'function') {
            params.onShow = function(){
                var pages = getCurrentPages()
                if ((!lastPath || ('/' + lastPath).indexOf(packPath + '/') !== 0) && ('/' + pages[pages.length-1].route).indexOf(packPath + '/') === 0) {
                    if (first) {
                        first = 0;
                        vueInit.onLaunch.call(vueInit, wx.getLaunchOptionsSync());
                    }
                    vueInit.onShow.call(vueInit, wx.getLaunchOptionsSync());
                }

                if (typeof onShow === 'function') {
                    return onShow.apply(this,arguments);
                }
            }
        }
    }
    Page = function (params) {
        intercept(params);
        return oldPage.call(this, params);
    }

    Component = function (params) {
        intercept(params.methods || {});
        return oldComponent.call(this, params);
    }
}
module.exports = {
    fakeUniBootstrap,
    fakeUniBootstrapName: 'fakeUniBootstrap'
}
