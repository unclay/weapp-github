const {
  // proxy,
  request,
} = require('../../common/js/promise_api.js');
const app = getApp();
const store = app.store;

Page({
  data: {
    repoList: [],
    reposEnd: false,
    apiSwitch: true,
    user: '',
    query: {
      type: 'all',
      page: 1,
      per_page: 50
    }
  },
  onLoad({ user }) {
    this.setData({
      user: user,
    });
    this.getRepos();
  },
  getRepos() {
    if (!this.data.apiSwitch) {
      return false;
    }
    this.apiSwitch(false);
    // 每次请求提示加载中
    wx.showLoading({
      title: 'loading...'
    });
    request({
      url: `${store.state.domain}/api/cache`,
      data: {
        url: `https://api.github.com/users/${this.data.user}/repos`,
        expire: 3600 * 1000,
        field: 'name full_name stargazers_count description owner',
        query: this.data.query
      }
    }).then((res) => {
      this.setData({
        repoList: this.data.repoList.concat(res.data),
      });
      wx.hideLoading();
      this.apiSwitch(true);
      if (res.data.length < this.data.query.per_page) {
        this.setData({
          reposEnd: true,
        });
      }
    }).catch((err) => {
      console.error(err);
      this.apiSwitch(true);
    });
  },
  onReachBottom() {
    if (this.data.apiSwitch) {
      if (!this.data.reposEnd) {
        this.addPage(1);
        this.getRepos();
      }
    }
  },
  apiSwitch(value) {
    this.setData({
      apiSwitch: value,
    });
  },
  addPage(val) {
    this.data.query.page += Number(val);
    this.setData({
      query: this.data.query,
    });
  },
});