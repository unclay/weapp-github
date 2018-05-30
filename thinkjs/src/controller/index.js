const Base = require('./base.js');

module.exports = class extends Base {
  async indexAction() {
    const user = await this.session('user');
    this.assign('user', user);
    return this.display('index_index');
  }
};
