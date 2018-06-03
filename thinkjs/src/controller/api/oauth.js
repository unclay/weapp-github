const qs = require('qs');

const BaseRest = require('../rest.js');

module.exports = class extends BaseRest {
  async getAction() {
    const user = await this.session('user');
    const userInfo = await this.modeldb('user', `id_${user.id}`);
    return this.success({
      user,
      userInfo
    });
  }
  async postAction() {
    const code = this.post('code');
    const state = this.post('state');
    if (state !== 'githubyuan') {
      return this.fail(1000, '非法授权Github源');
    }
    const clientId = this.config('github').client_id;
    const clientSecret = this.config('github').client_secret;
    const loginOauth = 'https://github.com/login/oauth/access_token';
    let res = await this.fetch(loginOauth, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      body: qs.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        state
      })
    }).then(res => res.text());
    res = qs.parse(res);
    if (res.error) {
      /*
      {
        "error": "bad_verification_code",
        "error_description": "The code passed is incorrect or expired.",
        "error_uri": "https://developer.github.com/apps/managing-oauth-apps/troubleshooting-oauth-app-access-token-request-errors/#bad-verification-code"
      }
      */
      return this.fail(1000, res);
    }
    res = await this.fetch(`https://api.github.com/user?access_token=${res.access_token}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(res => res.json());
    const user = await this.session('user');
    const userInfo = await this.modeldb('user', `id_${user.id}`);
    userInfo.github = {
      login: res.login,
      id: res.id,
      avatar_url: res.avatar_url
    };
    await this.modeldb('user', userInfo.openid, userInfo);
    await this.session('user', {
      id: userInfo.id,
      github_id: userInfo.github.id
    });
    return this.success('绑定成功');
  }
};
