const store = getApp().store;
const wemark = require('../wemark/wemark.js');
const atob = require('../readme/atob.js');
const {
  request,
} = require('../../common/js/promise_api.js');

Page({
  data: {
    query: {
      user: '',
      number: -1
    },
    issueitem: {},
    issueComments: [],
    participants: [],
    wemark,
    errText: '',
    issueitemAvatarLoaded: false,
  },
  onShareAppMessage() {
    return {
      title: `Github - ${this.data.query.user}`,
      path: `/pages/issueitem/issueitem?user=${this.data.query.user}`,
    }
  },
  onPullDownRefresh() {
    this.getissueitem(() => {
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
  getissueitem(callback) {
    const self  = this;
    // 每次请求提示加载中
    wx.showLoading({
      title: 'loading...'
    });
    request({
      url: 'https://www.unclay.com/cache',
      data: {
        url: `https://api.github.com/repos/${self.data.query.user}/${self.data.query.name}/issues/${self.data.query.number}`,
        expire: 60 * 60
      }
    }).then((res) => {
      if (res.data.status && res.data.response) {
        return self.showError(res.data.response.text)
      }
      const item = res.data;
      const now = parseInt(new Date().getTime() / 1000, 10);
      const create = parseInt(new Date(item.updated_at).getTime() / 1000, 10);
      const diff = now - create;
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
      item.after_long_time = `Updated ${item.after_long_time}`;
      wemark.parse(decodeURIComponent(res.data.body), self, {
        imageWidth: wx.getSystemInfoSync().windowWidth - 40,
        name: 'wemark'
      });
      self.setData({
        issueitem: item,
      });
      return request({
        url: 'https://www.unclay.com/cache',
        data: {
          url: `https://api.github.com/repos/${self.data.query.user}/${self.data.query.name}/issues/${self.data.query.number}/comments`,
          expire: 60 * 60
        }
      });
    }).then((res) => {
      if (res.data.status && res.data.response) {
        return self.showError(res.data.response.text)
      }
      let participants = [this.data.issueitem.user.id];
      for (const item of res.data) {
        participants.push(item.user.id);
      }
      participants = participants.remDub();
      const issueComments = res.data.map((item) => {
        const now = parseInt(new Date().getTime() / 1000, 10);
        const create = parseInt(new Date(item.updated_at).getTime() / 1000, 10);
        const diff = now - create;
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
      });
      self.setData({
        issueComments: res.data,
        participants,
      });
      wx.hideLoading();
      callback && callback(null);
    }).catch((err) => {
      self.showError(err && (err.errMsg || err + ''));
      callback && callback(err);
    });
  },
  onAvatarUrlLoad() {
    this.setData({
      issueitemAvatarLoaded: true,
    });
  },
  onLoad({ name, user, number }) {
    this.data.query.name = name;
    this.data.query.user = user;
    this.data.query.number = number;
    this.setData({
      query: this.data.query,
    });
    this.getissueitem();
    wx.setNavigationBarTitle({
      title: 'issueitem'
    });
  }
});