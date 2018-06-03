const {
  proxy,
  request,
} = require('../../common/js/promise_api.js');
const app = getApp();

module.exports = {
  onBindGithub () {
    // wx.showLoading({
    //   title: 'loading...'
    // });
    app.store.state.showWebViewGithubLogin = true;
    wx.navigateTo({
      url: '/pages/login-github/login-github',
    });
    const interval = setInterval(() => {
      if (app.store.state.showWebViewGithubLogin) {
        wx.showLoading({
          title: '绑定中...'
        });
      } else {
        clearInterval(interval);
        this.onLoad();
      }
    }, 100);
  },
  onGetUserInfo () {
    let code;
    let info;
    proxy('login')
      .then((res) => {
        code = res.code;
        return proxy('getUserInfo');
      })
      .then((res) => {
        info = res;
        return request({
          method: 'POST',
          url: 'http://192.168.1.10:8110/api/login',
          data: {
            code,
            rawData: res.rawData,
            iv: res.iv,
            signature: res.signature,
            encryptedData: res.encryptedData,
          },
        });
      })
      .then((res) => {
        wx.setStorageSync('cookie', res.data.data.cookie);
        this.setUserInfo(Object.assign(info.userInfo, {
          id: res.data.data.id,
        }));
      })
      .catch((res) => {
        if (res && res.errmsg) {
          app.toast(res.errmsg);
        } else {
          app.toast(String(res));
        }
      });
  },
};
