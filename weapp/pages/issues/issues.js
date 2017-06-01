const searchBar = require('../../components/search-bar/index.js');
const store = getApp().store;
const {
  request,
} = require('../../common/js/promise_api.js');
let cacheList = [];
Page({
  data: {
    query: {
      user: '',
      name: '',
      state: 'open',
    },
    list: [],
  },
  onPullDownRefresh() {
    this.getIssues(() => {
      wx.stopPullDownRefresh();
    });
  },
  onSearchBarChange(e) {
    this.data.list = cacheList.filter((item) => {
      if (item.title.match(new RegExp(e.detail.value, 'gi')) || String(item.number).match(new RegExp(e.detail.value, 'gi'))) {
        return item;
      }
    });
    this.setData({
      list: this.data.list,
    });
  },
  showError(err) {
    const setdata = {
      errText: String(JSON.stringify(err))
    };
    this.setData(setdata);
    wx.hideLoading();
  },
  onStateOpen() {
    this.data.query.state = 'open';
    this.setData({
      query: this.data.query,
    });
    this.getIssues();
  },
  onStateClosed() {
    this.data.query.state = 'closed';
    this.setData({
      query: this.data.query,
    });
    this.getIssues();
  },
  getIssues(callback) {
    const self  = this;
    // 每次请求提示加载中
    wx.showLoading({
      title: 'loading...'
    });
    cacheList = [];
    self.setData({
      list: [],
    });
    const repos = `${self.data.query.user}/${self.data.query.name}`;
    request({
      url: 'https://www.unclay.com/cache',
      data: {
        url: `https://api.github.com/repos/${repos}/issues`,
        expire: 60 * 60,
        state: self.data.query.state,
      }
    }).then((res) => {
      if (res.data.status && res.data.response) {
        return self.showError(res.data.response.text)
      }
      const list = res.data.map((item) => {
        const now = parseInt(new Date().getTime() / 1000, 10);
        const create = parseInt(new Date(item.updated_at).getTime() / 1000, 10);
        const diff = now - create;
        const num = 0;
        const type = '';
        if (diff < 60) {
          item.after_long_time = `${diff} seconds ago`;
        } else if (diff < 60 * 60) {
          item.after_long_time = `${Math.floor(diff / 60)} minutes ago`;
        } else if (diff < 24 * 60 * 60) {
          item.after_long_time = `${Math.floor(diff / 60 / 60)} hours ago`;
        } else if (diff < 30 * 24 * 60 * 60) {
          item.after_long_time = `${Math.floor(diff / 60 / 60 / 24)} days ago`;
        } else if (diff < 12 * 30 * 24 * 60 * 60) {
          item.after_long_time = `${Math.floor(diff / 60 / 60 / 24)} months ago`;
        } else {
          item.after_long_time = `${Math.floor(diff / 60 / 60 / 24 / 30)} months ago`;
        }

        // 类型
        item.issue_type = item.pull_request ? 'Pull' : 'Issue';
        return item;
      });
      cacheList = list;
      self.setData({
        list,
      });
      wx.hideLoading();
      callback && callback(null);
    }).catch((err) => {
      self.showError(err && err.errMsg);
      callback && callback(err);
    });
  },
  onLoad({ name, user }) {
    searchBar.init.apply(this);

    this.data.query.user = user;
    this.data.query.name = name;
    this.setData({
      query: this.data.query,
    });
    this.getIssues();
    wx.setNavigationBarTitle({
      title: 'Issues'
    });
  },
});
