'use strict';
const assert = require('assert');
const SDK = require('./sdk');

module.exports = app => {
  const conf = app.config;
  assert(conf.weapp && conf.weapp.appId && conf.weapp.appSecret);
  app.weapp = new SDK(Object.assign({
  }, app.config.weapp), app);
};
