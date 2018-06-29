'use strict';
const assert = require('assert');
const FileStore = require('./file-store');

module.exports = app => {
  const { config } = app;
  const conf = config.localdb;
  if (conf && conf.dbs && conf.dbs.length > 0) {
    conf.dir = conf.dir || `${config.baseDir}/localdb`;
    let dbItem = conf.dbs[0];
    assert(dbItem.name, 'config.localdb.dbs[0].name must be array');
    app.localdb = new FileStore(conf.dir, dbItem.name);
    app.localdb[dbItem.name] = app.localdb;
    app.localdb.$config = conf;
    if (dbItem.index && dbItem.index.length > 0) {
      app.localdb.index(dbItem.index);
    }
    for (let i = 1; i < conf.dbs.length; i++) {
      dbItem = conf.dbs[i];
      app.localdb[dbItem.name] = new FileStore(conf.dir, dbItem.name);
      if (dbItem.index && dbItem.index.length > 0) {
        app.localdb[dbItem.name].index(dbItem.index);
      }
    }
  }
};
