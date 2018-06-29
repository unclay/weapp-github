'use strict';
// const path = require('path');

module.exports = {
  Query: {
    user() {
      return {
        name: 123,
      };
    },
    cookie(root, options, ctx) {
      let count = ctx.cookies.get('count');
      count = count ? Number(count) : 0;
      ctx.cookies.set('count', ++count);
      return {
        count,
      };
    },
  },
};
