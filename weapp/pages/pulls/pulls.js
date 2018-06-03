const tabBar = require('../../components/tab-bar/index.js');
const searchBar = require('../../components/search-bar/index.js');
const {
  request,
} = require('../../common/js/promise_api.js');
const store = getApp().store;

Page({
  data: {
    query: {
      page: 1,
    },
    tabBar: {
      state: 'open',
      loading: false,
    },
    searchBar: {
      focus: false,
    },
    pulls: [],
    pullsFilter: [],
    errText: '',
    apiSwitch: true,
    pullsEnd: false,
  },
  onPullDownRefresh() {
    this.getPulls();
  },
  onReachBottom() {
    if (this.data.apiSwitch) {
      this.setSubRoot('query', 'page', this.data.query.page + 1);
      this.getPulls();
    }
  },
  setRoot(json) {
    this.setData(json);
  },
  setSubRoot(root, key, value) {
    this.data[root][key] = value;
    const json = {};
    json[root] = this.data[root];
    this.setData(json);
  },
  apiSwitch(value) {
    this.setData({
      apiSwitch: value,
    });
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
    if (self.data.tabBar.loading) {
      return false;
    }
    this.setSubRoot('tabBar', 'loading', true);
    request({
      url: `${store.state.domain}/api/cache`,
      data: {
        url: `https://api.github.com/repos/${self.data.query.user}/${self.data.query.name}/pulls`,
        expire: 60 * 60 * 1000,
        query: {
          state: this.data.tabBar.state,
          page: this.data.query.page,
        }
      }
    }).then((res) => {
      if (res.data.status && res.data.response) {
        return self.showError(res.data.response.text);
      }
      if (res.data.length < 30) {
        this.setData({
          pullsEnd: true,
        });
      }
      const arr = [];
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
          item.after_long_time = `${Math.floor(diff / 60 / 60 / 24 / 30)} months ago`;
        } else {
          item.after_long_time = `${Math.floor(diff / 60 / 60 / 24 / 30 / 12)} years ago`;
        }
        arr.push({
          title: item.title,
          user: {
            avatar_url: item.user.avatar_url,
          },
          after_long_time: item.after_long_time,
        })
      }
      self.setData({
        pulls: this.data.pulls.concat(arr),
      });
      if (self.data.searchBar.value) {
        self.getPullsFilter(self.data.searchBar.value);
      }
      // wx.hideLoading();
      self.setSubRoot('tabBar', 'loading', false);
    }).catch((err) => {
      self.showError(err && err.errMsg);
      self.setSubRoot('tabBar', 'loading', false);
    });
  },
  onTabBarClick(e) {
    if (this.data.tabBar.state === e.currentTarget.dataset.type) {
      return false;
    }
    this.data.pulls = [];
    this.data.pullsFilter = [];
    this.data.tabBar.state = e.currentTarget.dataset.type;
    this.data.query.page = 1;
    this.setData({
      tabBar: this.data.tabBar,
      pulls: this.data.pulls,
      pullsFilter: this.data.pullsFilter,
      pullsEnd: false,
    });
    this.getPulls();
  },
  getPullsFilter(val) {
    let arr = [];
    if (val) {
      arr = this.data.pulls.filter((item) => {
        if (item.title.match(new RegExp(val, 'gi'))) {
          return item;
        }
      });
    }
    this.setData({
      pullsFilter: arr,
    });
  },
  onSearchBarChange(e) {
    this.getPullsFilter(e.detail.value);
  },
  onSearchBarCancel(e) {
    this.getPullsFilter();
  },
  onLoad({ name, user, branch }) {
    let res;
    try {
      res = wx.getSystemInfoSync()
    } catch (e) {
      // Do something when catch error
    }
    tabBar.init.apply(this);
    searchBar.init.apply(this);

    this.data.query.name = name;
    this.data.query.user = user;
    this.setData({
      query: this.data.query,
      windowHeight: res.windowHeight,
    });
    this.getPulls();
    wx.setNavigationBarTitle({
      title: 'Pull Request'
    });
  }
})