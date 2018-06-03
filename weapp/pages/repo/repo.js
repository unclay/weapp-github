const store = getApp().store;
const {
  request,
} = require('../../common/js/promise_api.js');

Date.prototype.Format = function(fmt) {
  var o = {
    'M+': this.getMonth() + 1, //月份 
    'd+': this.getDate(), //日 
    'h+': this.getHours(), //小时 
    'm+': this.getMinutes(), //分 
    's+': this.getSeconds(), //秒 
    'q+': Math.floor((this.getMonth() + 3) / 3), //季度 
    'S': this.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
  return fmt;
}
Page({
  onShareAppMessage() {
    return {
      title: `Github - ${this.data.query.user}/${this.data.query.name}`,
      path: `/pages/repo/repo?name=${this.data.query.name}&user=${this.data.query.user}`,
    }
  },
  data: {
    query: {
      name: '',
    },
    repo: {},
    repoAvatarLoaded: false,
    errText: ''
  },
  onPullDownRefresh() {
    this.getRepo(() => {
      wx.stopPullDownRefresh();
    });
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
    const repos = `${self.data.query.user}/${self.data.query.name}`;
    // 每次请求提示加载中
    wx.showLoading({
      title: 'loading...'
    });
    request({
      url: `${store.state.domain}/api/cache`,
      data: {
        url: `https://api.github.com/repos/${repos}`,
        expire: 60 * 60 * 1000
      }
    }).then((res) => {
      if (res.data.status && res.data.response) {
        return self.showError(res.data.response.text)
      }
      // 格式化时间
      res.data.created_at = new Date(res.data.created_at).Format('MM/dd/yy')
      // 格式化所有文件大小
      if (res.data.size >= 1000) {
        res.data.size = fomatFloat(res.data.size/1000, 2) + 'MB';
      } else {
        res.data.size = res.data.size + 'KB';
      }
      self.setData({
        repo: res.data
      })
      return request({
        url: `${store.state.domain}/api/cache`,
        data: {
          url: `https://api.github.com/repos/${repos}/branches`,
          expire: 60 * 60 * 1000
        }
      });
    }).then((res) => {
      if (res.data.status && res.data.response) {
        return self.showError(res.data.response.text)
      }
      // 计算分支数量
      self.data.repo.branches_count = res.data.length;
      // readme
      self.setData({
        repo: self.data.repo
      })
      wx.hideLoading();
      callback && callback(null);
    }).catch((err) => {
      self.showError(err && err.errMsg);
      callback && callback(err);
    });
  },
  onAvatarUrlLoad() {
    this.setData({
      repoAvatarLoaded: true,
    });
  },
  onLoad({ name, user }) {
    this.data.query.name = name;
    this.data.query.user = user;
    this.setData({
      query: this.data.query,
    });
    this.getRepo();
    wx.setNavigationBarTitle({
      title: 'Repository'
    });
  }
});

function fomatFloat(src, pos){
  return Math.round(src*Math.pow(10, pos))/Math.pow(10, pos);
}