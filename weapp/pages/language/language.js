const { language, state } = require('../store/index');
const searchBar = require('../../components/search-bar/index.js');
Page({
  data: {
    searchBar: {
      focus: false,
    },
    language: {
      options: language,
      state: state.trending.language,
    }
  },
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },
  onSearchBarChange(e) {
    this.data.language.options = language.filter((item) => {
      if (item.name.match(new RegExp(e.detail.value, 'gi'))) {
        return item;
      }
    });
    this.setData({
      language: this.data.language,
    });
  },
  onSelectChange(e) {
    state.trending.language = this.data.language.options[e.currentTarget.dataset.index];
    this.data.language.state = this.data.language.options[e.currentTarget.dataset.index];
    this.setData({
      language: this.data.language
    })
    wx.navigateBack();
  },
  onLoad() {
    this.data.language.state = state.trending.language;
      this.setData({
        language: this.data.language
      })
    searchBar.init.apply(this).params({
      type: '',
    });
  }
})