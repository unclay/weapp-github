'use strict';
const path = require('path');
const FileStore = require('../../extend/file-store');
const session = new FileStore(path.resolve(__dirname, '../../../localdb'), 'session');

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
    session(root, options, ctx) {
      // let count = ctx.session.count || 0;
      // ctx.session.count = ++count;
      let data = session.set(ctx.session.sid, {});
      // console.log(ctx.session.sid, data);
      ctx.session.sid = data.id;
      data = session.set(data.id, {
        count: data.count ? data.count + 1 : 1,
      });
      // console.log(ctx.session.sid, data);
      return {
        count: data.count,
      };
    },
  },
};
