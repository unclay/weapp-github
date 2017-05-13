//index.js
//获取应用实例
var app = getApp()
const {
  request,
  downloadFile,
  saveFile
} = require('../../common/js/promise_api.js');
Page({
  data: {
    trending: {
      since: 'today'
    },
    trendingList: [],
    errText: ''
  },
  //事件处理函数
  sinceTab: function(e) {
    this.setData({
      trending: {
        since: e.currentTarget.dataset.since
      }
    })
    this.getTrending();
  },
  getTrending() {
    const self = this;
    request({
      url: 'https://www.unclay.com/cache',
      data: {
        url: 'http://anly.leanapp.cn/api/github/trending',
        since: this.data.trending.since
      }
    }).then((res) => {
      // 保存图片到本地，方便下次使用
      const storeAvatars = wx.getStorageSync('avatars') || {};
      let fileIndex = 0;
      const loopDownload = (cb) => {
        if (fileIndex >= 5) {
          return cb();
        }
        if (storeAvatars[res.data[fileIndex].avatar]) {
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
    }).catch((err) => {
      self.setData({
        errText: String(err)
      })
    });
  },
  onLoad: function () {
    this.getTrending();
  }
})
