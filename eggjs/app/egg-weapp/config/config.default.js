'use strict';

module.exports = {
  weapp: {
    wxLoginExpires: 7200,
    domain: 'https://api.weixin.qq.com',
    methods: {
      login: '/sns/jscode2session',
    },
  },
};
