const assert = require('assert');
const helper = require('think-helper');
const Debounce = require('think-debounce');

const debounceInstance = new Debounce();

/**
 * db manage
 * can not be defined a arrow function, because has `this` in it.
 * @param {String} name
 * @param {Mixed} value
 * @param {String|Object} config
 */
function thinkDb(name, value, config) {
  assert(name && helper.isString(name), 'db.name must be a string');
  if (config) {
    config = helper.parseAdapterConfig(this.config('db'), config);
  } else {
    config = helper.parseAdapterConfig(this.config('db'));
  }
  const Handle = config.handle;
  assert(helper.isFunction(Handle), 'db.handle must be a function');
  delete config.handle;
  const instance = new Handle(config);
  // delete db
  if (value === null) {
    return Promise.resolve(instance.delete(name));
  }
  // get db
  if (value === undefined) {
    return debounceInstance.debounce(name, () => {
      return instance.get(name);
    });
  }

  // get db when value is function
  if (helper.isFunction(value)) {
    return debounceInstance.debounce(name, () => {
      let dbData;
      return instance.get(name).then(data => {
        if (data === undefined) {
          return value(name);
        }
        dbData = data;
      }).then(data => {
        if (data !== undefined) {
          dbData = data;
          return instance.set(name, data);
        }
      }).then(() => {
        return dbData;
      });
    });
  }
  // set db
  return Promise.resolve(instance.set(name, value));
}

module.exports = thinkDb;
