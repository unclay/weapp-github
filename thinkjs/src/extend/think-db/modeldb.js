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
async function thinkDb(table, name, value, config) {
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

  // get db
  if (value === undefined) {
    return debounceInstance.debounce(`table_${table}_${name}`, () => {
      return instance.get(`table_${table}_${name}`);
    });
  }

  let tableValue;
  let tableInfo = await Promise.resolve(instance.get(`table_${table}`));
  if (!tableInfo) {
    tableInfo = {
      name: table,
      full_name: `table_${table}`,
      length: 0,
      auto_id: 0,
      map: {}
    };
    await Promise.resolve(instance.set(`table_${table}`, tableInfo));
  } else {
    tableValue = await Promise.resolve(instance.get(`table_${table}_${name}`));
  }

  // delete db
  if (value === null) {
    if (tableValue && tableInfo.length > 0) {
      tableInfo.length -= 1;
      delete tableInfo.map[name];
      await Promise.resolve(instance.set(`table_${table}`, tableInfo));
    }
    return Promise.resolve(instance.delete(`table_${table}_${name}`));
  }

  // set db
  assert(helper.isObject(value), 'db.handle must be a object');
  let newValue;
  if (!tableValue) {
    tableInfo.length += 1;
    tableInfo.auto_id += 1;
    tableInfo.map[name] = tableInfo.auto_id;
    await Promise.resolve(instance.set(`table_${table}`, tableInfo));
    newValue = Object.assign(value, {
      id: tableInfo.auto_id
    });
    await Promise.resolve(instance.set(`table_${table}_${name}`, newValue));
    return newValue;
  }
  newValue = Object.assign(value, {
    id: tableValue.id
  });
  await Promise.resolve(instance.set(`table_${table}_${name}`, newValue));
  return newValue;
}

module.exports = thinkDb;
