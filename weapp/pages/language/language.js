const { language, state } = require('../store/index');

Page({
  data: {
    select: {
      options: language,
      index: 0
    }
  },
  onSelectChange(e) {
    state.trending.language = e.currentTarget.dataset.index;
    this.data.select.index = e.currentTarget.dataset.index
    this.setData({
      select: this.data.select
    })
    wx.navigateBack();
  }
})