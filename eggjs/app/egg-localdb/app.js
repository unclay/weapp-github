'use strict';

module.exports = app => {
  app.localdb = Object.assign({}, app.config.localdb, {
    dir: app.config.localdb.dir || `${app.config.baseDir}/localdb`,
  });
};
