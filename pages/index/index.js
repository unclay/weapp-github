//index.js
//获取应用实例
var app = getApp()
const { since, language } = require('../store/index');
const {
  request,
  downloadFile,
  saveFile
} = require('../../common/js/promise_api.js');
Page({
  data: {
    sinceRange: {
      today: 'today',
      weekly: 'this week',
      monthly: 'this month'
    },
    trending: {
      since: {
        index: 0,
        range: since
      },
      language: {
        index: 0,
        range: language
      }
    },
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
  onLanguageChange(e) {
    this.data.trending.language.index = e.detail.value;
    this.setData({
      trending: this.data.trending
    });
    this.getTrending();
  },
  getTrending() {
    const self = this;
    const since = this.data.trending.since;
    const language = this.data.trending.language;
    let languageValue = language.range[language.index].value;
    if (languageValue) {
      languageValue = `/${languageValue}`
    }
    const query = {
      url: `http://anly.leanapp.cn/api/github/trending${languageValue}`,
      since: since.range[since.index].value,
    };
    // 每次请求提示加载中
    wx.showLoading({
      title: 'loading...'
    });
    // 每次请求清空trending
    this.setData({
      trendingList: [],
      trendingNullText: 'Loading...'
    })
    request({
      url: 'https://www.unclay.com/cache',
      data: query
    }).then((res) => {
      if (!res.data || res.data.length === 0) {
        wx.hideLoading();
        return this.setData({
          trendingList: [],
          trendingNullText: 'We couldn’t find any trending repositories.'
        })
      }
      // 保存图片到本地，方便下次使用
      const storeAvatars = wx.getStorageSync('avatars') || {};
      let fileIndex = 0;
      const loopDownload = (cb) => {
        const url = res.data[fileIndex].avatar;
        if (fileIndex >= 5) {
          return cb();
        }
        if (url.match(/wxfile/gi) || storeAvatars[url]) {
          return cb();
        }
        // 从微信下载
        downloadFile({
          url: res.data[fileIndex].avatar
        }).then((downloadFileRes) => {
          // 保存到本地
          return saveFile({
            tempFilePath: downloadFileRes.tempFilePath
          });
        }).then((saveFileRes) => {
          storeAvatars[res.data[fileIndex].avatar] = saveFileRes.savedFilePath;
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

      self.setData({
        trendingList: res.data
      })
      wx.hideLoading();
    }).catch((err) => {
      self.setData({
        errText: String(err)
      })
      wx.hideLoading();
    });
  },
  onLoad: function () {
    this.getTrending();
  }
})
