const {
  request,
} = require('../../common/js/promise_api.js');
const searchBar = require('../../components/search-bar/index.js');

Page({
  data: {
    query: {
      name: '',
    },
    searchBar: {
      value: '',
      focus: false,
    },
    repos: [],
    searchEnd: true,
    apiSwitch: true,
    errText: '',
    page: 1,
  },
  onReachBottom() {
    if (this.data.apiSwitch) {
      if (!this.data.searchEnd) {
        console.log(5)
        this.setData({
          page: this.data.page + 1,
        });
        this.getRepo();
      }
    }
  },
  apiSwitch(value) {
    this.setData({
      apiSwitch: value,
    });
  },
  onSearchBarChange(e) {
    
  },
  onSearchBarConfirm(e) {
    this.data.query.name = e.detail.value;
    this.setData({
      repos: [],
      page: 1,
      query: this.data.query,
    });
    this.getRepo();
  },
  showError(err) {
    const setdata = {
      errText: String(JSON.stringify(err))
    };
    this.setData(setdata);
    wx.hideLoading();
  },
  getRepo(callback) {
    const self  = this;
    if (!self.data.apiSwitch) {
      return false;
    }
    self.setData({
      searchEnd: false,
    });
    self.apiSwitch(false);
    request({
      url: 'https://www.unclay.com/cache',
      data: {
        url: `https://api.github.com/search/repositories`,
        expire: 60 * 60,
        q: this.data.query.name,
        per_page: 10,
        page: this.data.page,
      }
    }).then((res) => {
      if (res.data.status && res.data.response) {
        return self.showError(res.data.response.text)
      }
      self.setData({
        repos: self.data.repos.concat(res.data.items),
      });
      if (res.data.total_count > self.data.repos.length ) {
        self.setData({
          searchEnd: false,
        });
      } else {
        self.setData({
          searchEnd: true,
        });
      }
      self.apiSwitch(true);
    }).catch((err) => {
      self.showError(err && err.errMsg);
      callback && callback(err);
      self.apiSwitch(true);
    });
  },
  onLoad() {
    wx.setNavigationBarTitle({
      title: 'Explore'
    })
    searchBar.init.apply(this);
  },
});
