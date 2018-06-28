'use strict';

module.exports = class SDK {
  constructor(options, app) {
    this.app = app;
    this.config = options;
  }
  async login(code) {
    let requestUrl = `${this.config.domain}${this.config.methods.login}`;
    requestUrl = `${requestUrl}?appid=${this.config.appId}`;
    requestUrl = `${requestUrl}&secret=${this.config.appSecret}`;
    requestUrl = `${requestUrl}&js_code=${code}&grant_type=authorization_code`;
    return (await this.app.curl(requestUrl, {
      dataType: 'json',
    })).data;
  }
};
