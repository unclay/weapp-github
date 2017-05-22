//app.js
const store = require('./pages/store/index');
App({
  store,
  onLaunch: function () {

  },
  globalData:{
    userInfo: null,

  }
})