const {
  request,
} = require('../../common/js/promise_api.js');
const wemark = require('../wemark/wemark.js');
const atob = require('./atob.js');
const store = getApp().store;
Page({
  data: {
    query: {},
    wemark: {},
    errText: ''
  },
  onShareAppMessage() {
    return {
      title: `Github - ${this.data.query.user}/${this.data.query.name}`,
      path: `/pages/repo/repo?name=${this.data.query.name}&user=${this.data.query.user}`,
    }
  },
  onPullDownRefresh() {
    this.getReadme(() => {
      wx.stopPullDownRefresh();
    });
  },
  showError(err) {
    const setdata = {
      errText: String(JSON.stringify(err))
    };
    this.setData(setdata);
    wx.hideLoading();
  },
  getReadme(callback) {
    const self = this;
    const repos = `${self.data.query.user}/${self.data.query.name}`;
    // 每次请求提示加载中
    wx.showLoading({
      title: 'loading...'
    });
    request({
      url: `${store.state.domain}/api/cache`,
      data: {
        url: `https://api.github.com/repos/${repos}/readme`,
        expire: 3600 * 1000
      }
    }).then((res) => {
      if (res.data.status && res.data.response) {
        return self.showError(res.data.response.text)
      }
      wemark.parse(decodeURIComponent(escape(atob(res.data.content))), self, {
        imageWidth: wx.getSystemInfoSync().windowWidth - 40,
        name: 'wemark'
      })
      wx.hideLoading();
      callback && callback(null);
    }).catch((err) => {
      self.showError(err && err.errMsg);
      callback && callback(err);
    });
  },
  onLoad({ name, user }) {
    this.data.query.name = name;
    this.data.query.user = user;
    this.setData({
      query: this.data.query,
    });

    this.getReadme();
  }
})