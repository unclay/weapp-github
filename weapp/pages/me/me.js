const {
  request,
  proxy
} = require('../../common/js/promise_api.js');
const loginEvent = require('./login.js');
const onEvent = require('./on.js');
const profileEvent = require('./profile.js');
const app = getApp();
const store = app.store;

Page(Object.assign({
  data: {
    isWeappLogin: false,
    isGithubLogin: false,
    userInfo: {},
    profile: {},
    inputVal: '',
    loading: false,
  },
  onShareAppMessage() {
    return {
      title: 'Github ' + (userInfo.github_login || userInfo.nickName),
      path: '/pages/profile/profile?user=' + userInfo.github_login,
    }
  },
  onPullDownRefresh() {
    this.getMember(() => {
      wx.stopPullDownRefresh();
    });
  },
  onLoad() {
    const self = this;
    const cookie = wx.getStorageSync('cookie');
    if (!cookie) {
      return this.goToLogin();
    }
    this.getMember();
  },
  getMember(callback) {
    request({
      url: `${store.state.domain}/api/user/member`
    }).then((res) => {
      const data = res.data.data;
      if (data.id) {
        this.setUserInfo(data);
        this.getLocalUserInfo();
        this.getProfile(data.github_login);
      }
      if (callback) {
        callback();
      }
    }).catch((res) => {
      console.log(res);
      if (res.data.errno !== 901) {
        app.toast(res.data.errmsg);
      }
      this.goToLogin();
    });
  },
}, loginEvent, onEvent, profileEvent));
