const {
  proxy,
  request,
} = require('../../common/js/promise_api.js');
const app = getApp();
const store = app.store;

module.exports = {
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
};
