const {
  proxy,
  request,
} = require('../../common/js/promise_api.js');
const app = getApp();
const store = app.store;

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
          url: `${store.state.domain}/api/login`,
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
        this.onLoad();
        // this.setUserInfo(Object.assign(info.userInfo, {
        //   id: res.data.data.id,
        // }));
      })
      .catch((res) => {
        if (res && res.errmsg) {
          app.toast(res.errmsg);
        } else {
          app.toast(JSON.stringify((res)));
        }
      });
  },
  onScanToken() {
    proxy('scanCode')
      .then((data) => {
        if (data.result) {
          this.setData({
            inputVal: data.result
          });
        } else {
          alert(data.errMsg);
        }
      })
      .catch((err) => {
        console.error(err);
      })
  },
  onBindGithubByToken() {
    this.setData({
      loading: true
    });
    request({
      method: 'POST',
      url: `${store.state.domain}/api/token`,
      data: {
        token: this.data.inputVal
      }
    }).then((res) => {
      this.setData({
        loading: false
      });
      this.onLoad();
    }).catch((err) => {
      console.error(err);
    });
  },
};
