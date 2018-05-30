const qs = require('qs');

const BaseRest = require('./rest.js');

module.exports = class extends BaseRest {
  async getAction() {
    const code = this.get('code');
    const state = this.get('state');
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
    await this.session('user', {
      login: res.login,
      id: res.id,
      avatar_url: res.avatar_url
    });
    return this.redirect('http://127.0.0.1:8100');
  }
};
