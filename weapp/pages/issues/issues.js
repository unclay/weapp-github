const searchBar = require('../../components/search-bar/index.js');
console.log(searchBar);

Page({
  data: {

  },
  onLoad() {
    searchBar.init.apply(this);
  }
})