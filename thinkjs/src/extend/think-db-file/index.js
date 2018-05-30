/*
* @Author: lushijie
* @Date:   2017-03-16 09:23:41
* @Last Modified by:   lushijie
* @Last Modified time: 2017-09-11 12:28:55
*/
const path = require('path');
const helper = require('think-helper');
const assert = require('assert');
const fs = require('fs');
const readFile = helper.promisify(fs.readFile, fs);
const unlink = helper.promisify(fs.unlink, fs);
// const gc = require('think-gc');
const FileStore = require('think-store-file');
const _getRelativePath = Symbol('getRelativePath');

const defaultOptions = {
  timeout: 24 * 3600 * 1000,
  dbPath: '',
  pathDepth: 1,
  gcInterval: 24 * 3600 * 1000
};

/**
 * file cache adapter
 */
class FileCache {
  constructor(config) {
    config = helper.extend({}, defaultOptions, config);
    this.timeout = config.timeout;
    this.dbPath = config.dbPath;
    this.pathDepth = config.pathDepth;
    this.store = new FileStore(this.dbPath);
    assert(this.dbPath && helper.isString(this.dbPath), 'config.dbPath must be set');

    // gc interval by 1 hour
    // this.gcType = `cache-${this.dbPath}`;
    // gc(this, config.gcInterval);
  }

  /**
   * get file path by the cache key
   * @param  {String} key [description]
   * @return {String}     [description]
   */
  [_getRelativePath](key) {
    key = helper.md5(key);
    const dir = key.slice(0, this.pathDepth).split('').join(path.sep);
    return path.join(dir, key);
  }

  /**
   * get cache by the cache key
   * @param  {String} key [description]
   * @return {Promise}      [description]
   */
  get(key) {
    const relativePath = this[_getRelativePath](key);
    return this.store.get(relativePath).then(content => {
      if (!content) {
        return;
      }
      try {
        content = JSON.parse(content);
        if (Date.now() > content.expire) {
          return this.store.delete(relativePath);
        } else {
          return content.content;
        }
      } catch (e) {
        return this.store.delete(relativePath);
      }
    });
  }

  /**
   * set cache
   * @param {String} key     [description]
   * @param {String} content [description]
   * @param {Number} timeout [millisecond]
   * @return {Promise}      [description]
   */
  set(key, content, timeout = this.timeout) {
    const relativePath = this[_getRelativePath](key);
    const tmp = {
      content: content
    };
    return this.store.set(relativePath, JSON.stringify(tmp));
  }

  /**
   * delete cache by the cache key
   * @param  {String} key [description]
   * @return {Promise}     [description]
   */
  delete(key) {
    const relativePath = this[_getRelativePath](key);
    return this.store.delete(relativePath);
  }

  async modelSet(table, key, content) {
    let tableInfo = await this.get(`table_${table}`);
    if (!tableInfo) {
      tableInfo = {
        name: table,
        full_name: `table_${table}`,
        length: 0
      };
    }
    return this.set(`table_${table}_${key}`, content);
  }

  /**
   * delete expired key
   * @return {[type]} [description]
   */
  gc() {
    const files = helper.getdirFiles(this.dbPath);
    files.forEach(file => {
      const filePath = path.join(this.dbPath, file);
      readFile(filePath, 'utf8').then(content => {
        if (!content) return Promise.reject(new Error('content empty'));
        content = JSON.parse(content);
        if (Date.now() > content.expire) {
          return Promise.reject(new Error('cache file expired'));
        }
      }).catch(() => {
        unlink(filePath).catch(() => {});
      });
    });
  }
}

module.exports = FileCache;
