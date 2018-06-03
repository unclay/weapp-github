//app.js
const store = require('./pages/store/index');
App({
  store,
  onLaunch: function () {
    
  },
  globalData:{
    userInfo: null,

  },
  toast(content, callback) {
    wx.showToast({
      title: content,
      icon: 'none',
    });
    if (callback) {
      callback();
    }
  },
  isError(e) {
    return (objectToString(e) === '[object Error]' || e instanceof Error);
  }
})

Array.prototype.remDub = Array.prototype.remDub || function () {
  //return Array.from(new Set(this));
  return [...new Set(this)];
};

function objectToString(o) {
  return Object.prototype.toString.call(o);
}