const {
  request,
  downloadFile,
  saveFile
} = require('../../common/js/promise_api.js');
const {
  toast,
  store,
} = getApp();

Page({
  data: {
  },
  onLoad: function () {
  },
  onWebMsg (data) {
    const self = this;
    if (!data.detail.data || !data.detail.data[0] || !data.detail.data[0].code) {
      return alert('授权失败');
    }
    // wx.showLoading({
    //   title: 'loading...'
    // });
    request({
      method: 'POST',
      url: 'http://192.168.1.10:8110/api/oauth',
      data: {
        code: data.detail.data[0].code,
        state: data.detail.data[0].state,
      }
    }).then((res) => {
      toast(res.data.data);
      store.state.showWebViewGithubLogin = false;
    }).catch((res) => {
      toast(res.data.errmsg);
    });
  }
});