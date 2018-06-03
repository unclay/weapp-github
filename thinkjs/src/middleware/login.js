module.exports = (options, app) => {
  return async(ctx, next) => {
    const user = await ctx.session('user');
    if (!user) {
      return ctx.fail(901, '用户未登录');
    }
    return next();
  };
};
