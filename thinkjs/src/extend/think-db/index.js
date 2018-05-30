const thinkDb = require('./db.js');
const thinkModeldb = require('./modeldb.js');

/**
 * extends to think, controller, context
 */
module.exports = {
  controller: {
    db: thinkDb,
    modeldb: thinkModeldb
  },
  context: {
    db: thinkDb,
    modeldb: thinkModeldb
  },
  think: {
    db: thinkDb,
    modeldb: thinkModeldb
  }
};
