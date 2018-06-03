const {
  request,
  proxy
} = require('../../common/js/promise_api.js');
const loginEvent = require('./login.js');
const onEvent = require('./on.js');
const profileEvent = require('./profile.js');
const app = getApp();
const store = app.store;
console.log(store);

Page(Object.assign({
  data: {
    isWeappLogin: false,
    isGithubLogin: false,
    userInfo: {},
    profile: {},
  },
  onLoad() {
    const self = this;
    const cookie = wx.getStorageSync('cookie');
    if (!cookie) {
      return this.goToLogin();
    }
    request({
      url: `${store.state.domain}/api/user/member`
    }).then((res) => {
      const data = res.data.data;
      if (data.id) {
        self.setUserInfo(data);
        self.getLocalUserInfo();
        self.getProfile(data.github_login);
      }
    }).catch((res) => {
      if (res.data.errno !== 901) {
        app.toast(res.data.errmsg);
      }
      self.goToLogin();
    })
  },
}, loginEvent, onEvent, profileEvent));
