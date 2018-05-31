// const qs = require('qs');
const crypto = require('crypto');

const BaseRest = require('../rest.js');
const Wxcrypty = require('./wxcrypto.js');

module.exports = class extends BaseRest {
  async postAction() {
    const code = this.post('code');
    const rawData = this.post('rawData');
    const iv = this.post('iv');
    const signature = this.post('signature');
    const encryptedData = this.post('encryptedData');
    let requestUrl = 'https://api.weixin.qq.com/sns/jscode2session';
    requestUrl = `${requestUrl}?appid=${this.config('weapp').appId}`;
    requestUrl = `${requestUrl}&secret=${this.config('weapp').appSecret}`;
    requestUrl = `${requestUrl}&js_code=${code}&grant_type=authorization_code`;
    const res = await this.fetch(requestUrl).then(res => res.json());
    if (res.errcode) {
      return this.fail(res.errcode, res.errmsg);
    }
    if (signature !== crypto.createHash('sha1').update(`${rawData}${res.session_key}`).digest('hex')) {
      return this.fail(1100, '数据签名校验失败');
    }
    const pc = new Wxcrypty(this.config('weapp').appId, res.session_key);
    let userInfo = pc.decryptData(encryptedData, iv);
    userInfo.openid = userInfo.openId || userInfo.openid;
    delete userInfo.openId;
    userInfo = await this.modeldb('weapp_user', userInfo.openid, userInfo);
    await this.session('weapp_user', {
      id: userInfo.id,
      openid: userInfo.openid
    });
    return this.success({
      id: userInfo.id
    });
  }
};
