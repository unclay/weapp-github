module.exports = class extends think.Controller {
  static get _REST() {
    return true;
  }

  async getAction() {
    return this.success('未定义GET方式');
  }
  /**
   * put resource
   * @return {Promise} []
   */
  async postAction() {
    return this.success('未定义POST方式');
  }
  /**
   * delete resource
   * @return {Promise} []
   */
  async deleteAction() {
    return this.success('未定义DELETE方式');
  }
  /**
   * update resource
   * @return {Promise} []
   */
  async putAction() {
    return this.success('未定义PUT方式');
  }
  __call() {}
};
