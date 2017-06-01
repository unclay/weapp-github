const store = getApp().store;
const {
  request,
} = require('../../common/js/promise_api.js');

Page({
  data: {
    query: {
      user: '',
      name: '',
    },
    events: [],
  },
  onPullDownRefresh() {
    this.getEvents(() => {
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
  getEvents(callback) {
    const self  = this;
    // 每次请求提示加载中
    wx.showLoading({
      title: 'loading...'
    });
    const repos = `${self.data.query.user}/${self.data.query.name}`;
    request({
      url: 'https://www.unclay.com/cache',
      data: {
        url: `https://api.github.com/repos/${repos}/events`,
        expire: 60 * 60
      }
    }).then((res) => {
      console.log(res);
      if (res.data.status && res.data.response) {
        return self.showError(res.data.response.text)
      }
      self.setData({
        events: res.data.map((item) => {
          const now = parseInt(new Date().getTime() / 1000, 10);
          const create = parseInt(new Date(item.created_at).getTime() / 1000, 10);
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
          return item;
        }),
      });
      wx.hideLoading();
      callback && callback(null);
    }).catch((err) => {
      self.showError(err && err.errMsg);
      callback && callback(err);
    });
  },
  onLoad({ name, user }) {
    this.data.query.user = user;
    this.data.query.name = name;
    this.setData({
      query: this.data.query,
    });
    this.getEvents();
    wx.setNavigationBarTitle({
      title: 'Events'
    });
  },
});