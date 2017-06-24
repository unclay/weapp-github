function init(options) {
  const self = this;
  const setSearchBarData = (key, value) => {
    self.data.searchBar[key] = value;
    self.setData({
      searchBar: self.data.searchBar,
    });
  }
  self.data.searchBar = self.data.searchBar || {}
  self.setData({
    searchBar: self.data.searchBar || {},
  });

  self.params = (options = {}) => {
    setSearchBarData('type', options.type || '');
    return self;
  }

  self.__onSearchBarChange = (e) => {
    setSearchBarData('value', e.detail.value);
    if (!self.onSearchBarChange) {
      console.warn('no define onSearchBarChange');
    } else {
      self.onSearchBarChange(e);
    }
  }

  self.onFocus = (e) => {
    setSearchBarData('focus', true);
  };

  self.__onSearchBarCancel = (e) => {
    setSearchBarData('focus', false);
    setSearchBarData('value', '');
    if (!self.onSearchBarCancel) {
      console.warn('no define onSearchBarCancel');
    } else {
      self.onSearchBarCancel(e);
    }
  }

  return self;
}
module.exports = {
  init,
};