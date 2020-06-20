const nodeAst = require('./src/gulpCore/nodeAst')
const htmlMixins = require('./src/gulpCore/plugins/htmlMixin')
// const {JSDOM} = require('jsdom')
// const ast = new nodeAst(`
// <view class="limt-tips">
//                 {{goodsInfo.activityInfo.activityStatus <= 2 ? '距活动开始' : goodsInfo.activityInfo.activityStatus == 3 ? '距活动结束' : '活动已结束'}}
//               </view>
// `)

const aaa = htmlMixins(`
<wxs src="../../../utils/picFilter.wxs" module="picFilter" />
<wxs module="Progress">
     var getProgress = function(pix, max_width = 110){
        return Math.ceil(pix/100*max_width);
    }
    module.exports.getProgress = getProgress;
</wxs>
<template name="community_goodsList">
  <view class="dragon-goods-list">
    <view wx:if="{{goodsList && goodsList.length}}" class="good-item-wrap">
      <view wx:for="{{goodsList}}" wx:for-item="good" wx:key="{{index}}" class="good-item dragon-clear-fix">
        <view class="img-cover good-img-wrap" bindtap="jumpTuGoodDetail" data-index="{{index}}" data-goods-id="{{good.goodsId}}" data-src="{{good.defaultImageUrl}}" data-title="{{good.title}}" data-imagepx="md" data-point="{{false}}" style="background-image:url({{picFilter(good.defaultImageUrl, 'md', pictureRatio)}});">
          <view wx:if="{{activityState == 1 && (good.noStockType ==2)}}" class="sold-out-wrap"></view>
          <view wx:if="{{activityState == 1 && (good.noStockType ==2)}}" class="sold-out">
            <text class="sold-out-text">已抢光</text>
          </view>
        </view>
        <view class="good-detail dragon-clear-fix">
          <view class="goods-title text-line2" bindtap="jumpTuGoodDetail" data-index="{{index}}" data-goods-id="{{good.goodsId}}" data-src="{{good.defaultImageUrl}}" data-title="{{good.title}}" data-imagepx="md" data-point="{{false}}">
            {{good.title}}
          </view>
          <view class="price-wrap">
            <text class="price" style="{{customTheme.color}}">{{currency.symbol}}<text class="min-pric">{{good.minPrice}}</text></text>
            <text wx:if="{{good.minPrice - good.minOriginalPrice < 0 && good.minOriginalPrice.length <=9}}" class="price-del">{{currency.symbol}}{{good.minOriginalPrice}}</text>
            <text wx:if="{{good.isLimitBuy && good.limitBuyNum}}" class="limit_buy_box theme-color" style="{{customTheme.color}}">限购{{good.limitBuyNum}}件</text>
          </view>
          <view class="progress-wrap" wx:if="{{activityState === 1 && good.noStockType != 2}}">
            <view class="good-progress">
              <view class="progress" style="width:{{Progress.getProgress(good.progressRate)}}rpx;"></view>
            </view>
            <view wx:if="{{good.stockNum < 5 && good.stockNum > 0}}" class="text surplus" style="{{customTheme.color}}">
              仅剩{{good.stockNum}}件
            </view>
          </view>
          <view wx:if="{{grouponId && activityState === 1 && good.noStockType != 2}}" class="cart-wrap dragon-clear-fix flex">
            <button open-type="getUserInfo" bindgetuserinfo="reduce" wx:if="{{good.cartGoods && good.cartGoods.num > 0}}" data-index="{{index}}" style="{{customTheme.bdc+';'+customTheme.color}}" class="dragon-fl reduce iconfont icon-jian1"></button>
            <text wx:if="{{good.cartGoods && good.cartGoods.num > 0}}" class="dragon-fl good-num">{{good.cartGoods.num}}</text>
            <button class='recommend-item-cart' open-type="getUserInfo" bindgetuserinfo="addGood" data-index="{{index}}" style="{{customTheme.bgc+';'+customTheme.bdc}}" class="dragon-fr add iconfont icon-jia1"></button>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-loading {{showWaterMark? 'show_mark':''}}" wx:if="{{goodsList.length || goodsLoading}}">
        <view class="loadMore" wx:if="{{!goodsIsEnd || goodsLoading}}">
            <view class="loadings"></view>正在加载，请稍后...</view>
        <view class="loadMore" wx:elif="{{goodsIsEnd && goodsList.length}}">没有更多了~</view>
    </view>
    <view class="loadMore" wx:elif="{{goodsIsEnd && goodsList.length}}">没有更多了~</view>
  </view>
  <view wx:if="{{goodsList.length == 0 && !goodsLoading}}" class="no-goods">
    <view class="no-good-wrap">
      <image lazy-load="true" class="no-good-img" src="https://cdn2.weimob.com/saas/@assets/saas-fe-retail-h5-stc/image/market/community/nogoods2x.png" />
      <view class="no-good-text">暂无商品</view>
    </view>
  </view>
</template>

`,{relative:'aaa'})
// aaa.childNodes[1]={
//     nodeType:3,
//     rawText:'aaaa',
//     childNodes:[]
// }
// aaa.childNodes[0].attributes.aaa = 'dd'
// aaa.childNodes[0].rawAttrs = 'ccc="a"'
// aaa.topNode.children[0].attrs=[{name:'bbb', value:'444'}]

console.log(aaa)
