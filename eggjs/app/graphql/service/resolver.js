'use strict';
module.exports = {
  Query: {
    login(root, options, ctx) {
      console.log(ctx.service.weapp.user());
      return ctx.service.weapp.user();
    },
  },
};
