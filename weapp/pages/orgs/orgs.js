const {
  request,
} = require('../../common/js/promise_api.js');

Page({
  data: {
    query: {
    },
    errText: '',
    orgs: [],
  },
  showError(err) {
    const setdata = {
      errText: String(JSON.stringify(err))
    };
    this.setData(setdata);
    wx.hideLoading();
  },
  onPullDownRefresh() {
    this.getOrgs(() => {
      wx.stopPullDownRefresh();
    });
  },
  getOrgs: function (callback) {
    const self  = this;
    // 每次请求提示加载中
    wx.showLoading({
      title: 'loading...'
    });
    request({
      url: `${store.state.domain}/api/cache`,
      data: {
        url: `https://api.github.com/users/${self.data.query.user}/orgs`,
        expire: 60 * 60 * 1000
      }
    }).then((res) => {
      if (res.data.status && res.data.response) {
        return self.showError(res.data.response.text);
      }
      self.setData({
        orgs: res.data,
      });
      wx.hideLoading();
      callback && callback(null);
    }).catch((err) => {
      self.showError(err && err.errMsg);
      callback && callback(err);
    });
  },
  onLoad({ user }) {
    this.data.query.user = user;
    this.setData({
      query: this.data.query,
    });
    this.getOrgs();
    wx.setNavigationBarTitle({
      title: 'Organizations'
    });
  }
})