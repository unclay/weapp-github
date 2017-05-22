const { language, state } = require('../store/index');

Page({
  data: {
    select: {
      options: language,
      state: state.trending.language,
      focus: false,
    }
  },
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },
  onInputChange(e) {
    this.data.select.options = language.filter((item) => {
      if (item.name.match(new RegExp(e.detail.value, 'gi'))) {
        return item;
      }
    });
    this.data.select.value = '';
    this.setData({
      select: this.data.select,
    });
  },
  onFocus() {
    this.data.select.focus = true;
    this.setData({
      select: this.data.select,
    });
  },
  onSelectChange(e) {
    state.trending.language = this.data.select.options[e.currentTarget.dataset.index];
    this.data.select.state = this.data.select.options[e.currentTarget.dataset.index];
    this.setData({
      select: this.data.select
    })
    wx.navigateBack();
  },
  onShow() {
    this.data.select.state = state.trending.language;
    this.setData({
      select: this.data.select
    })
  }
})