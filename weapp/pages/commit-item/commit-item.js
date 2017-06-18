const store = getApp().store;
const wemark = require('../wemark/wemark.js');
const atob = require('../readme/atob.js');
const {
  request,
} = require('../../common/js/promise_api.js');

Page({
  data: {
    query: {
    },
    commitItem: {},
    wemark: '',
    errText: '',
    itemAvatarLoaded: false,
  },
  onPullDownRefresh() {
    this.getcommititem(() => {
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
  getCommititem(callback) {
    const self  = this;
    // 每次请求提示加载中
    wx.showLoading({
      title: 'loading...'
    });
    request({
      url: 'https://www.unclay.com/cache',
      data: {
        url: `https://api.github.com/repos/${self.data.query.user}/${self.data.query.name}/commits/${self.data.query.sha}`,
        expire: 60 * 60,
      }
    }).then((res) => {
      if (res.data.status && res.data.response) {
        return self.showError(res.data.response.text)
      }
      const item = res.data;
      const now = parseInt(new Date().getTime() / 1000, 10);
      const create = parseInt(new Date(item.commit.author.date).getTime() / 1000, 10);
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
      item.after_long_time = `Updated ${item.after_long_time}`;
      if (item.commit.message && item.commit.message.split('\n') && item.commit.message.split('\n').length > 0) {
        item.commit.messageTitle = item.commit.message.split('\n')[0];
      }
      // fixed URI malformed (% question)
      let uriWemark;
      try {
        uriWemark = decodeURIComponent(res.data.commit.message);
      } catch(err) {
        uriWemark = decodeURIComponent(res.data.commit.message.replace(/%/gi, escape('%')));
      }
      wemark.parse(uriWemark, self, {
        imageWidth: wx.getSystemInfoSync().windowWidth - 40,
        name: 'wemark'
      });
      self.setData({
        commitItem: item,
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
      itemAvatarLoaded: true,
    });
  },
  onLoad({ name, user, sha }) {
    this.data.query.name = name;
    this.data.query.user = user;
    this.data.query.sha = sha;
    this.setData({
      query: this.data.query,
    });
    this.getCommititem();
    wx.setNavigationBarTitle({
      title: 'Commit'
    });
  }
});