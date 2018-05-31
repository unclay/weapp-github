const sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

Page({
  data: {
    tabs: ["Token", "Qrcode"],
    activeIndex: 1,
    sliderOffset: 0,
    sliderLeft: 0,
    loginInfo: '',
    userInfo: {}
  },
  onLoad: function () {
    const self = this;
    wx.getSystemInfo({
      success: function(res) {
        self.setData({
          sliderLeft: (res.windowWidth / self.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / self.data.tabs.length * self.data.activeIndex
        });
      }
    });
    wx.setNavigationBarTitle({
      title: 'Sign'
    });
    this._login((login) => {
      this._getUserInfo((res) => {
        this.setLoginInfo(res, login.code)
      })
    })
  },
  setLoginInfo(data, code) {
    console.log(data);
    if (data.userInfo) {
      this.setData({ userInfo: data.userInfo });
      delete data.userInfo;
      this.setData({ loginInfo: data });
      if (code) {
        wx.request({
          method: 'POST',
          url: 'http://192.168.1.10:8110/api/login',
          data: {
            code,
            rawData: data.rawData,
            iv: data.iv,
            signature: data.signature,
            encryptedData: data.encryptedData,
          }
        });
      }
    }
  },
  _login(callback) {
    wx.login({
      success: function(res) {
        callback(res)
      },
      fail: function(res) {
        console.log(res);
        alert('登录失败！' + res.errMsg)
      },
    });
  },
  _getUserInfo(callback) {
    wx.getUserInfo({
      // withCredentials: true,
      success: function(res) {
        callback(res)
      },
      fail: function(res) {
        // wx.showModal({
        //   content: res.errMsg,
        //   success: function(res) {
        //     if (res.confirm) {
        //       console.log('用户点击确定')
        //     } else if (res.cancel) {
        //       console.log('用户点击取消')
        //     }
        //   }
        // })
      },
    });
  },
  bindGetUserInfo: function (ele) {
    this._login((login) => {
      this.setLoginInfo(ele.detail, login.code);
    });
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  clickSignIn: function () {
    wx.showModal({
      content: '安全起见，暂时不支持账号密码登录，推荐token登录，或者扫码登录。',
      showCancel: false,
    });
  },
  scanQrcode: function () {
    wx.scanCode({
      success: function (e) {
        console.log(e);
      }
    });
  },
  onAvatarUrlLoad() {}
});