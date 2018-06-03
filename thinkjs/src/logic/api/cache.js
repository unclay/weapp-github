module.exports = class extends think.Logic {
  getAction() {
    const rules = {
      url: {
        required: true
      }
    };
    const flag = this.validate(rules);
    if (!flag) {
      let errMsg;
      for (const key in this.validateErrors) {
        if (!errMsg) {
          errMsg = this.validateErrors[key];
          break;
        }
      }
      return this.fail(1001, errMsg);
    }
  }
};
