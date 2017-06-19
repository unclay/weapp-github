const {
  request,
} = require('../../common/js/promise_api.js');

Page({
  onPullDownRefresh: function(){
    wx.stopPullDownRefresh()
  },
  onReachBottom() {
    if (this.data.apiSwitch) {
      if (this.data.commits.length === 0) {
        this.addPage(1);
        this.getCommits(false);
      } else if (this.data.commits[this.data.commits.length - 1].parents.length > 0) {
        this.addPage(1);
        this.getCommits(false);
      }
    }
  },
  data: {
    query: {
      page: 1,
    },
    commits: [],
    errText: '',
    apiSwitch: true,
  },
  showError(err) {
    const setdata = {
      errText: String(JSON.stringify(err))
    };
    this.setData(setdata);
    wx.hideLoading();
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
  getCommits: function (needLoad = true, callback) {
    const self  = this;
    if (!self.data.apiSwitch) {
      return false;
    }
    self.apiSwitch(false);
    request({
      url: 'https://www.unclay.com/cache',
      data: {
        url: `https://api.github.com/repos/${self.data.query.user}/${self.data.query.name}/commits`,
        expire: 60 * 60,
        sha: self.data.query.branch,
        page: self.data.query.page,
      }
    }).then((res) => {
      if (res.data.status && res.data.response) {
        return self.showError(res.data.response.text);
      }
      for (const item of res.data) {
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
        if (item.commit.message && item.commit.message.split('\n') && item.commit.message.split('\n').length > 0) {
          item.commit.message = item.commit.message.split('\n')[0];
        }
      }
      self.setData({
        commits: this.data.commits.concat(res.data),
      });
      callback && callback(null);
      self.apiSwitch(true);
    }).catch((err) => {
      self.showError(err && err.errMsg);
      callback && callback(err);
      self.apiSwitch(true);
    });
  },
  onLoad({ name, user, branch }) {
    this.data.query.name = name;
    this.data.query.user = user;
    this.data.query.branch = branch;
    this.setData({
      query: this.data.query,
    });
    this.getCommits();
    wx.setNavigationBarTitle({
      title: 'Commits'
    });
  }
})