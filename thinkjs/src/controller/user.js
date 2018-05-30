module.exports = class extends think.Controller {
  async indexAction() {
    const user = await this.session('user');
    this.assign('user', user);
    return this.display('index_index');
  }
};
