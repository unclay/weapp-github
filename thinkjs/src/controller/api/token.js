// const qs = require('qs');

const BaseRest = require('../rest.js');

module.exports = class extends BaseRest {
  async postAction() {
    const token = this.post('token');
    const res = await this.fetch(`https://api.github.com/user?access_token=${token}`, {
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
