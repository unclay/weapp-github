'use strict';
const FileStore = require('../../file-store');

module.exports = {
  localdb(name) {
    const { app: { localdb } } = this;
    const store = new FileStore(localdb.dir, name);
    if (localdb.index && localdb.index[name]) {
      store.index(localdb.index[name]);
    }
    return store;
  },
};
