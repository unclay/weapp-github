function init(options) {
  const self = this;
  self.setData({
    tabBar: self.data.tabBar || {},
  });

  self.params = (options = {}) => {
    self.data.searchBar.state = options.state || '';
    self.setData({
      searchBar: self.data.searchBar,
    });
    return self;
  }

  if (!self.onTabBarClick) {
    self.onTabBarClick = (e) => {
      console.warn('no define onTabBarClick');
    }
  }

  return self;
}
module.exports = {
  init,
};