const store = getApp().store;
const {
  request,
} = require('../../common/js/promise_api.js');

Page({
  data: {
    query: {
      user: '',
    },
    profile: {},
    errText: ''
  },
  onPullDownRefresh() {
    this.getProfile(() => {
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
  getProfile: function (callback) {
    const self  = this;
    // 每次请求提示加载中
    wx.showLoading({
      title: 'loading...'
    });
    request({
      url: 'https://www.unclay.com/cache',
      data: {
        url: `https://api.github.com/users/${self.data.query.user}`,
        expire: 60 * 60
      }
    }).then((res) => {
      console.log(res);
      if (res.data.status && res.data.response) {
        return self.showError(res.data.response.text)
      }
      self.setData({
        profile: res.data,
      });
      wx.hideLoading();
      callback && callback(null);
    }).catch((err) => {
      self.showError(err && err.errMsg);
      callback && callback(err);
    });
  },
  onAvatarUrlLoad() {
    this.data.profile.avatarUrlLoaded = true;
    this.setData({
      profile: this.data.profile,
    });
  },
  onLoad({ user }) {
    this.data.query.user = user;
    this.setData({
      query: this.data.query,
    });
    this.getProfile();
    wx.setNavigationBarTitle({
      title: 'Profile'
    });
  }
});