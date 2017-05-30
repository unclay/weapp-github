function init(options) {
  const self = this;
  self.data.searchBar = self.data.searchBar || {}
  self.setData({
    searchBar: self.data.searchBar || {},
  });

  self.params = (options = {}) => {
    self.data.searchBar.type = options.type || '';
    self.setData({
      searchBar: self.data.searchBar || {},
    });
    return self;
  }

  if (!self.onSearchBarChange) {
    self.onSearchBarChange = (e) => {
      console.warn('no define onSearchBarChange');
    }
  }

  self.onFocus = (e) => {
    self.data.searchBar.focus = true;
    self.setData({
      searchBar: self.data.searchBar,
    });
  };

  self.onSearchBarCancel = (e) => {
    self.data.searchBar.focus = false;
    self.setData({
      searchBar: self.data.searchBar,
    });
  }

  return self;
}
module.exports = {
  init,
};