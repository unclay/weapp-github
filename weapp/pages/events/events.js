const store = getApp().store;
const {
  request,
} = require('../../common/js/promise_api.js');

Page({
  data: {
    query: {
      user: '',
      name: '',
      page: 1,
    },
    events: [],
    eventsEnd: false,
    apiSwitch: true,
  },
  onPullDownRefresh() {
    this.getEvents(() => {
      wx.stopPullDownRefresh();
    });
  },
  onReachBottom() {
    if (this.data.apiSwitch) {
      if (!this.data.eventsEnd) {
        this.addPage(1);
        this.getEvents();
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
  showError(err) {
    const setdata = {
      errText: String(JSON.stringify(err))
    };
    this.setData(setdata);
    wx.hideLoading();
  },
  getEvents(callback) {
    const self  = this;
    if (!self.data.apiSwitch) {
      return false;
    }
    self.apiSwitch(false);
    let url = '';
    if (self.data.query.name) {
      url = `/repos/${self.data.query.user}/${self.data.query.name}/events`;
    } else {
      url = `/users/${self.data.query.user}/events`;
    }
    request({
      url: 'https://www.unclay.com/cache',
      data: {
        url: `https://api.github.com${url}`,
        page: self.data.query.page,
        expire: 60 * 60
      }
    }).then((res) => {
      if (res.data.status === 422) {
        return this.setData({
          eventsEnd: true,
        });
      }
      if (res.data.status && res.data.response) {
        return self.showError(res.data.response.text)
      }
      const events = res.data.map((item) => {
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
          if (Math.floor(diff / 60 / 60 / 24) === 1) {
            item.after_long_time = '1 days ago';
          } else {
            item.after_long_time = `${Math.floor(diff / 60 / 60 / 24)} days ago`;
          }
        } else if (diff < 12 * 30 * 24 * 60 * 60) {
          item.after_long_time = `${Math.floor(diff / 60 / 60 / 24)} months ago`;
        } else {
          item.after_long_time = `${Math.floor(diff / 60 / 60 / 24 / 30)} months ago`;
        }
        // branch
        if (item.payload && item.payload.ref) {
          item.payload.branch = item.payload.ref.replace('refs/heads/', '');
        }
        return item;
      });
      self.setData({
        events: this.data.events.concat(events),
      });
      callback && callback(null);
      self.apiSwitch(true);
    }).catch((err) => {
      self.showError(err && err.errMsg);
      callback && callback(err);
      self.apiSwitch(true);
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