const qs = require('qs');
const BaseRest = require('../rest.js');

module.exports = class extends BaseRest {
  async getAction() {
    const body = this.get();
    const url = body.url;
    const expire = body.expire;
    const field = body.field;
    let query;
    try {
      query = JSON.parse(body.query);
    } catch (err) {
      query = {};
    }
    const config = {};
    if (expire) {
      config.timeout = Number(expire);
    }
    const apiData = await this.cache(`${url}${field}${body.query}`, async() => {
      const requestUrl = url.match(/\?/) ? `${url}&${qs.stringify(query)}` : `${url}?${qs.stringify(query)}`;
      const data = await this.fetch(requestUrl, {
        body: qs.stringify(query)
      }).then(res => res.json());
      if (data && data.documentation_url) {
        return JSON.stringify(data);
      }
      const isArray = Object.prototype.toString.call(data) === '[object Array]';
      let newData = {};
      if (isArray) {
        newData = [];
      }
      if (!field) {
        newData = data;
      } else if (isArray) {
        const fields = field.split(' ');
        for (const item of data) {
          const itemJson = {};
          for (const key of fields) {
            if (item[key]) {
              itemJson[key] = item[key];
            }
          }
          newData.push(itemJson);
        }
      } else {
        const fields = field.split(' ');
        for (const key of fields) {
          if (data[key]) {
            newData[key] = data[key];
          }
        }
      }
      return JSON.stringify(newData);
    }, config);
    return this.json(apiData);
  }
};
