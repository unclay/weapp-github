const BaseRest = require('../../rest.js');

module.exports = class extends BaseRest {
  async getAction() {
    const sessionUser = await this.session('user');
    const userInfo = await this.modeldb('user', `id_${sessionUser.id}`);
    if (!userInfo) {
      await this.session('user', null);
      return this.fail(902, '用户不存在');
    }
    // userInfo get from weapp
    return this.success(userInfo);
  }
};
