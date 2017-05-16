const { language, state } = require('../store/index');

Page({
  data: {
    select: {
      options: language,
      index: state.trending.language || 0,
      focus: false,
    }
  },
  onFocus() {
    this.data.select.focus = true;
    this.setData({
      select: this.data.select,
    });
  },
  onSelectChange(e) {
    state.trending.language = e.currentTarget.dataset.index;
    this.data.select.index = e.currentTarget.dataset.index
    this.setData({
      select: this.data.select
    })
    wx.navigateBack();
  },
  onShow() {
    this.data.select.index = state.trending.language;
    this.setData({
      select: this.data.select
    })
  }
})