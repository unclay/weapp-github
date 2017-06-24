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

  self.__onTabBarClick = (e) => {
    if (self.data.tabBar.loading) {
      return false;
    }
    if (!self.onTabBarClick) {
      console.warn('no define onTabBarClick');
    } else {
      self.onTabBarClick(e);
    }
    
  }

  return self;
}
module.exports = {
  init,
};