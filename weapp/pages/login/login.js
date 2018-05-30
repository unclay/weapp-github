const sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

Page({
  data: {
    tabs: ["Token", "Qrcode"],
    activeIndex: 1,
    sliderOffset: 0,
    sliderLeft: 0
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
    wx.login({
      success: function(res) {
        if (res.code) {
          //发起网络请求
          wx.request({
            url: 'http://192.168.1.10:8110/api/login',
            data: {
              code: res.code
            }
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
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
});