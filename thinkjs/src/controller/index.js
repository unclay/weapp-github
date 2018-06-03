const crypto = require('crypto');

const Base = require('./base.js');

module.exports = class extends Base {
  async indexAction() {
    const user = await this.session('user');
    const cookie = await this.cookie(this.config('cookieName'));
    if (user) {
      const str = `${user.login}-${user.id}`;
      const cipher = crypto.createCipher('aes-256-cbc', this.config('github').client_secret);
      let crypted = cipher.update(str, 'utf8', 'hex');
      crypted += cipher.final('hex');
      this.assign('user', user);
      this.assign('sign', crypted);
      this.assign('cookie', cookie);
    }
    return this.display('index_index');
  }
};
