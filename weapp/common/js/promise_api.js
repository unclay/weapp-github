const Api = {
  request(options) {
    return new Promise((resolve, reject) => {
      const params = {
        success: resolve,
        fail: reject
      };
      for (const key in options) {
        if (!key.match(/success|fail|complete/gi)) {
          params[key] = options[key];
        }
      }
      wx.request(params);
    })
  },
  downloadFile(options) {
    return new Promise((resolve, reject) => {
      const params = {
        success: resolve,
        fail: reject
      };
      for (const key in options) {
        if (!key.match(/success|fail|complete/gi)) {
          params[key] = options[key];
        }
      }
      wx.downloadFile(params);
    })
  },
  saveFile(options) {
    return new Promise((resolve, reject) => {
      const params = {
        success: resolve,
        fail: reject
      };
      for (const key in options) {
        if (!key.match(/success|fail|complete/gi)) {
          params[key] = options[key];
        }
      }
      wx.saveFile(params);
    })
  }
};

module.exports = Api;