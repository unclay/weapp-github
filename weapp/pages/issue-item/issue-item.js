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
    wemark: '',
    errText: '',
    issueitemAvatarLoaded: false,
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
      url: `${store.state.domain}/api/cache`,
      data: {
        url: `https://api.github.com/repos/${self.data.query.user}/${self.data.query.name}/issues/${self.data.query.number}`,
        expire: 60 * 60 * 1000
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
      // fixed URI malformed (% question)
      let uriWemark;
      try {
        uriWemark = decodeURIComponent(res.data.body);
      } catch(err) {
        uriWemark = decodeURIComponent(res.data.body.replace(/%/gi, escape('%')));
      }
      wemark.parse(uriWemark, self, {
        imageWidth: wx.getSystemInfoSync().windowWidth - 40,
        name: 'wemark'
      });
      self.setData({
        issueitem: item,
      });
      return request({
        url: `${store.state.domain}/api/cache`,
        data: {
          url: `https://api.github.com/repos/${self.data.query.user}/${self.data.query.name}/issues/${self.data.query.number}/comments`,
          expire: 60 * 60 * 1000
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
      // 格式化数据
      res.data.map((item, index) => {
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
      // 渲染UI
      self.setData({
        issueComments: res.data,
        participants,
      });
      // 编译markdown
      self.data.issueComments.forEach((item, index) => {
        let uriWemark;
        try {
          uriWemark = decodeURIComponent(item.body);
        } catch(err) {
          uriWemark = decodeURIComponent(item.body.replace(/%/gi, escape('%')));
        }
        wemark.parse(uriWemark, self, {
          imageWidth: wx.getSystemInfoSync().windowWidth - 40,
          ext: {
            wemarkIndex: index,
            preview: true,
          },
          name: 'issueComments[{{wemarkIndex}}].bodyParse',
        });
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
      title: `Issue #${number}`
    });
  }
});