//index.js
//获取应用实例
var app = getApp()
const { since, language, state } = require('../store/index');
const {
  request,
  downloadFile,
  saveFile
} = require('../../common/js/promise_api.js');
Page({
  onShareAppMessage() {
    return {
      title: 'Github Trending',
      path: '/pages/index/index',
    }
  },
  onPullDownRefresh() {
    this.getTrending(() => {
      wx.stopPullDownRefresh();
    });
  },
  data: {
    trending: {
      since: {
        index: 0,
        range: since
      },
      language: {
        state: state.trending.language,
        range: language,
      }
    },
    unclay: '',
    trendingList: [],
    trendingNullText: 'Loading...',
    errText: ''
  },
  //事件处理函数
  onSinceChange(e) {
    this.data.trending.since.index = e.detail.value;
    this.setData({
      trending: this.data.trending
    });
    this.getTrending();
  },
  showError(err, trendingNullText) {
    const setdata = {
      errText: String(JSON.stringify(err))
    };
    if (trendingNullText) {
      setdata.trendingNullText = trendingNullText;
    }
    this.setData(setdata);
    wx.hideLoading();
  },
  getTrending(callback) {
    const self = this;
    const since = this.data.trending.since;
    const language = this.data.trending.language;
    const query = {
      url: 'http://trending.codehub-app.com/v2/trending',
      since: since.range[since.index].value,
      language: language.state.value,
      expire: 60 * 60
    };
    // 每次请求提示加载中
    wx.showLoading({
      title: 'loading...'
    });
    // 每次请求清空trending
    self.setData({
      unclay: '',
      trendingList: [],
      trendingNullText: 'Loading...'
    })
    request({
      url: 'https://www.unclay.com/cache',
      data: query
    }).then((res) => {
      if (res.data.status && res.data.response) {
        return self.showError(res.data.response.text, 'api error')
      }
      if (!res.data || res.data.length === 0) {
        wx.hideLoading();
        return self.setData({
          unclay: '',
          trendingList: [],
          trendingNullText: 'We couldn’t find any trending repositories.'
        })
      }
      // will remove image cache
      // 保存图片到本地，方便下次使用
      const storeAvatars = wx.getStorageSync('avatars') || {};
      let fileIndex = 0;
      const loopDownload = (cb) => {
        const url = res.data[fileIndex].owner.avatar_url;
        if (fileIndex >= 5) {
          return cb();
        }
        if (url.match(/wxfile/gi) || storeAvatars[url]) {
          return cb();
        }
        // 从微信下载
        downloadFile({
          url: res.data[fileIndex].owner.avatar_url
        }).then((downloadFileRes) => {
          // 保存到本地
          return saveFile({
            tempFilePath: downloadFileRes.tempFilePath
          });
        }).then((saveFileRes) => {
          storeAvatars[res.data[fileIndex].owner.avatar_url] = saveFileRes.savedFilePath;
          fileIndex++;
          loopDownload(cb);
        }).catch((err) => {
          fileIndex++;
          loopDownload(cb);
        });
      }
      loopDownload(() => {
        for (let i = 0; i < res.data.length; i++) {
          const url = res.data[i].avatar;
          const avatar = storeAvatars[url];
          if (avatar) {
            storeAvatars[url] = avatar;
          }
        }
        wx.setStorageSync('avatars', storeAvatars);
      });

      // 先从缓存提取图片
      for (let i = 0; i < res.data.length; i++) {
        res.data[i].avatar = storeAvatars[res.data[i].avatar] || res.data[i].avatar;
      }
      function fomatFloat(src, pos){
        return Math.round(src*Math.pow(10, pos))/Math.pow(10, pos);
      }
      self.setData({
        errText: '',
        unclay: {
          full_name: 'unclay/weapp-github',
          avatar_url: '../../common/img/avatar.png',
          description: 'Github weapp development plan',
        },
        trendingList: res.data.map((item) => {
          if (item.stargazers_count >= 1000) {
            item.stargazers_count = fomatFloat(item.stargazers_count/1000, 1) + 'k'
          }
          return item
        })
      })
      wx.hideLoading();
      callback && callback(null);
    }).catch((err) => {
      self.showError(err && err.errMsg, 'api error')
      wx.hideLoading();
      callback && callback(err);
    });
  },
  onLoad: function () {
    wx.setNavigationBarTitle({
      title: 'Trending'
    })
    // console.log('onload', state.trending.language)
    this.getTrending();
  },
  onReady() {
    // console.log('onready', state.trending.language);
  },
  onShow() {
    if (JSON.stringify(this.data.trending.language.state) !== JSON.stringify(state.trending.language)) {
      this.data.trending.language.state = state.trending.language;
      this.setData({
        trending: this.data.trending
      })
      this.getTrending();
    }
    // console.log('onqShow', state.trending.language);
  }
})
