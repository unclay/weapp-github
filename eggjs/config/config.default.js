'use strict';

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1529741056597_9098';

  // add your config here
  config.middleware = [ 'graphql' ];

  config.graphql = {
    router: '/graphql',
    // 是否加载到 app 上，默认开启
    app: true,
    // 是否加载到 agent 上，默认关闭
    agent: false,
    // 是否加载开发者工具 graphiql, 默认开启。路由同 router 字段。使用浏览器打开该可见。
    graphiql: true,
    // graphQL 路由前的拦截器
    // onPreGraphQL: function* (ctx) {},
    // 开发工具 graphiQL 路由前的拦截器，建议用于做权限操作(如只提供开发者使用)
    // onPreGraphiQL: function* (ctx) {},
  };

  exports.security = {
    csrf: {
      enable: false,
    },
  };

  exports.session = {
    key: 'weapp-github',
    maxAge: 7 * 24 * 3600 * 1000, // 1 天
    httpOnly: true,
    encrypt: true,
  };

  exports.localdb = {
    dbs: [
      {
        name: 'github',
        index: [ 'openId' ],
      },
      {
        name: 'weapp',
        index: [ 'openId' ],
      },
    ],
  };

  return config;
};
