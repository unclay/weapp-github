'use strict';

const Service = require('egg').Service;

class WeappService extends Service {
  user() {
    return {
      name: 'weapp user',
    };
  }
}

module.exports = WeappService;
