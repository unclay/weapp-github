const {
  proxy,
  request,
} = require('../../common/js/promise_api.js');
const app = getApp();
const store = app.store;

module.exports = {
  getProfile: function (user) {
    const self  = this;
    // 每次请求提示加载中
    wx.showLoading({
      title: 'loading...'
    });
    request({
      url: `${store.state.domain}/api/cache`,
      data: {
        url: `https://api.github.com/users/${user}`,
        expire: 7 * 24 * 3600 * 1000,
        field: 'followers following'
      }
    }).then((res) => {
      self.setData({
        profile: res.data,
      });
      wx.hideLoading();
    }).catch((err) => {
      console.log(err, 28);
    });
  },
};
