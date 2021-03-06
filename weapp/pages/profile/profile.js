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
    errText: '',
    profileAvatarLoaded: false,
  },
  onShareAppMessage() {
    return {
      title: `Github - ${this.data.query.user}`,
      path: `/pages/profile/profile?user=${this.data.query.user}`,
    }
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
      url: `${store.state.domain}/api/cache`,
      data: {
        url: `https://api.github.com/users/${self.data.query.user}`,
        expire: 60 * 60 * 1000
      }
    }).then((res) => {
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
    this.setData({
      profileAvatarLoaded: true,
    });
  },
  onLoad({ user }) {
    this.data.query.user = user || 'unclay';
    this.setData({
      query: this.data.query,
    });
    this.getProfile();
    wx.setNavigationBarTitle({
      title: 'Profile'
    });
  }
});