// const qs = require('qs');

const BaseRest = require('../rest.js');

module.exports = class extends BaseRest {
  async getAction() {
    const code = this.get('code');
    let requestUrl = 'https://api.weixin.qq.com/sns/jscode2session';
    requestUrl = `${requestUrl}?appid=${this.config('weapp').appId}`;
    requestUrl = `${requestUrl}&secret=${this.config('weapp').appSecret}`;
    requestUrl = `${requestUrl}&js_code=${code}&grant_type=authorization_code`;
    const res = await this.fetch(requestUrl).then(res => res.json());
    if (res.errcode) {
      return this.fail(res.errcode, res.errmsg);
    }
    const weappUser = await this.modeldb('weapp_user', res.openid, res);
    await this.session('weapp_user', res);
    return this.success({
      res,
      weappUser
    });
  }
};
