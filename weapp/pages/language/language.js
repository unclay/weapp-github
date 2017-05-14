const { language } = require('../store/index');

Page({
  data: {
    select: {
      options: language,
      index: 0
    }
  },
  onSelectChange(e) {
    this.data.select.index = e.currentTarget.dataset.index
    this.setData({
      select: this.data.select
    })
  }
})