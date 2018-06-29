'use strict';
const crypto = require('crypto');
const Wxcrypty = require('./wxcrypto.js');

module.exports = {
  Mutation: {
    async test(root, options, ctx) {
      let data = ctx.app.localdb.getByIndex(options.openId);
      if (!data) {
        data = ctx.app.localdb.create(options);
      }
      return data;
    },
    async test2(root, options, ctx) {
      let data = ctx.app.localdb.weapp.getByIndex(options.openId);
      if (!data) {
        data = ctx.app.localdb.weapp.create(options);
      }
      return data;
    },
    async login(root, { code, signature, rawData, encryptedData, iv }, ctx) {
      const rawDataStr = decodeURIComponent(rawData);
      console.log(rawDataStr);
      // console.log(weapp.login());
      const res = await ctx.app.weapp.login(code);
      if (res.errcode) {
        return ctx.reject(res.errmsg);
      }
      if (signature !== crypto.createHash('sha1').update(`${rawDataStr}${res.session_key}`).digest('hex')) {
        return ctx.reject('数据签名校验失败');
      }
      const pc = new Wxcrypty(ctx.app.config.weapp.appId, res.session_key);
      const userInfo = pc.decryptData(encryptedData, iv);
      userInfo.openid = userInfo.openId || userInfo.openid;
      delete userInfo.openId;
      delete userInfo.watermark;
      // const oldUserInfo = await this.modeldb('user', userInfo.openid);
      // console.log(oldUserInfo);
      // return this.success(oldUserInfo);
      // userInfo = await this.modeldb('user', userInfo.openid, Object.assign(oldUserInfo || {}, userInfo));
      // await this.session('user', {
      //   id: userInfo.id,
      //   github_id: userInfo.github ? userInfo.github.id : ''
      // });
      // const cookie = await this.cookie(this.config('cookieName'));
      // return this.success({
      //   github: userInfo.github,
      //   id: userInfo.id,
      //   cookie: `${this.config('cookieName')}=${cookie}`
      // });
      return userInfo;
    },
  },
};
