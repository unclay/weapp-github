const {
  // proxy,
  request,
} = require('../../common/js/promise_api.js');
const app = getApp();
const store = app.store;

Page({
  data: {
    repoList: []
  },
  onLoad({ user }) {
    this.getRepos(user);
  },
  getRepos(user) {
    // 每次请求提示加载中
    wx.showLoading({
      title: 'loading...'
    });
    request({
      url: `${store.state.domain}/api/cache`,
      data: {
        url: `https://api.github.com/users/${user}/repos`,
        expire: 3600 * 1000,
        field: 'name full_name stargazers_count description owner',
        query: {
          type: 'all'
        }
      }
    }).then((res) => {
      this.setData({
        repoList: res.data,
      });
      wx.hideLoading();
    }).catch((err) => {
      console.error(err);
    });
  }
});