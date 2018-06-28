'use strict';

module.exports = {
  reject(err) {
    return new Promise((resolve, reject) => reject(err));
  },
};
