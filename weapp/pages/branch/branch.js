const {
  request,
} = require('../../common/js/promise_api.js');
const store = getApp().store;

Page({
  data: {
    query: {
    },
    errText: '',
    branchs: [],
  },
  showError(err) {
    const setdata = {
      errText: String(JSON.stringify(err))
    };
    this.setData(setdata);
    wx.hideLoading();
  },
  onPullDownRefresh() {
    this.getBranchs(() => {
      wx.stopPullDownRefresh();
    });
  },
  getBranchs: function (callback) {
    const self  = this;
    // 每次请求提示加载中
    wx.showLoading({
      title: 'loading...'
    });
    request({
      url: `${store.state.store}/api/ache`,
      data: {
        url: `https://api.github.com/repos/${self.data.query.user}/${self.data.query.name}/branches`,
        expire: 60 * 60 * 1000
      }
    }).then((res) => {
      if (res.data.status && res.data.response) {
        return self.showError(res.data.response.text);
      }
      self.setData({
        branchs: res.data,
      });
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
    this.getBranchs();
    wx.setNavigationBarTitle({
      title: 'Branchs'
    });
  }
})