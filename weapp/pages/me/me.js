const {
  request,
  proxy
} = require('../../common/js/promise_api.js');
const onEvent = require('./on.js');
const app = getApp();
const store = app.store;

Page(Object.assign({
  data: {
    isWeappLogin: false,
    isGithubLogin: false,
    userInfo: {}
  },
  onLoad() {
    const self = this;
    const cookie = wx.getStorageSync('cookie');
    // if (!cookie) {
    //   return this.goToLogin();
    // }
    request({
      url: `${store.state.domain}/api/user/member`
    }).then((res) => {
      const data = res.data.data;
      if (data.id) {
        self.setUserInfo(data);
        self.getLocalUserInfo();
      }
    }).catch((res) => {
      if (res.data.errno !== 901) {
        app.toast(res.data.errmsg);
      }
      self.goToLogin();
    })
  },
  getLocalUserInfo () {
    const self = this;
    proxy('getUserInfo')
      .then((res) => {
        self.setUserInfo(Object.assign(res.userInfo, store.state.userInfo));
      })
      .catch((res) => {
        console.log(res.data);
      });
  },
  goToLogin() {
    // wx.redirectTo({
    //   url: '/pages/login/login'
    // });
    this.setData({
      isWeappLogin: true
    });
  },
  setUserInfo (data) {
    if (data.github) {
      data.github_id = data.github.id;
      data.github_avatar_url = data.github.avatar_url;
      data.github_login = data.github.login;
      delete data.github;
    }
    store.state.userInfo = data;
    this.setData({
      userInfo: data
    });
    if (!data.github_id && !this.data.isGithubLogin) {
      this.setData({
        isGithubLogin: true,
      });
    }
    if (data.github_id && this.data.isGithubLogin) {
      this.setData({
        isGithubLogin: false,
      });
    }
    if (data.id && this.data.isWeappLogin) {
      this.setData({
        isWeappLogin: false,
      });
    }
  }
}, onEvent));
