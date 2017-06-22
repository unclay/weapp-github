const tabBar = require('../../components/tab-bar/index.js');
const {
  request,
} = require('../../common/js/promise_api.js');

Page({
  data: {
    query: {},
    tabBar: {
      state: 'open',
    },
    pulls: [],
    errText: '',
  },
  onPullDownRefresh() {
    this.getPulls();
  },
  showError(err) {
    const setdata = {
      errText: String(JSON.stringify(err))
    };
    this.setData(setdata);
    wx.hideLoading();
  },
  getPulls: function () {
    const self = this;
    // 每次请求提示加载中
    wx.showLoading({
      title: 'loading...'
    });
    request({
      url: 'https://www.unclay.com/cache',
      data: {
        url: `https://api.github.com/repos/${self.data.query.user}/${self.data.query.name}/pulls`,
        expire: 60 * 60,
        state: this.data.tabBar.state,
      }
    }).then((res) => {
      if (res.data.status && res.data.response) {
        return self.showError(res.data.response.text);
      }
      for (const item of res.data) {
        const now = parseInt(new Date().getTime() / 1000, 10);
        const create = parseInt(new Date(item.created_at).getTime() / 1000, 10);
        const diff = now - create;
        if (diff < 60) {
          item.after_long_time = `${diff} seconds ago`;
        } else if (diff < 60 * 60) {
          item.after_long_time = `${Math.floor(diff / 60)} minutes ago`;
        } else if (diff < 24 * 60 * 60) {
          item.after_long_time = `${Math.floor(diff / 60 / 60)} hours ago`;
        } else if (diff < 30 * 24 * 60 * 60) {
          if (Math.floor(diff / 60 / 60 / 24) === 1) {
            item.after_long_time = 'yesterday';
          } else {
            item.after_long_time = `${Math.floor(diff / 60 / 60 / 24)} days ago`;
          }
        } else if (diff < 12 * 30 * 24 * 60 * 60) {
          item.after_long_time = `${Math.floor(diff / 60 / 60 / 24)} months ago`;
        } else {
          item.after_long_time = `${Math.floor(diff / 60 / 60 / 24 / 30)} years ago`;
        }
      }
      self.setData({
        pulls: res.data,
      });
      wx.hideLoading();
    }).catch((err) => {
      self.showError(err && err.errMsg);
    });
  },
  onTabBarClick(e) {
    this.data.pulls = [];
    this.data.tabBar.state = e.currentTarget.dataset.type;
    this.setData({
      tabBar: this.data.tabBar,
      pulls: this.data.pulls,
    });
    this.getPulls();
  },
  onLoad({ name, user, branch }) {
    tabBar.init.apply(this);

    this.data.query.name = name;
    this.data.query.user = user;
    this.setData({
      query: this.data.query,
    });
    this.getPulls();
    wx.setNavigationBarTitle({
      title: 'Pull Request'
    });
  }
})