'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const helper = require('think-helper');
const { isObject, isNumber } = require('./util');

class VStore {
  constructor(name, id, store, index) {
    assert(name, 'table name need');
    this.name = name;
    this.id = id || 0;
    this.indexs = [];
    this.index = index || {};
    this.store = store || {};
  }
  create(data) {
    assert(!data.id, 'data.id no need');
    data.id = ++this.id;
    for (const key in this.index) {
      assert(data[key] && this.index[key] && !this.index[key][data[key]], `index.${key} exist`);
      if (data[key]) {
        this.index[key] = this.index[key] || {};
        this.index[key][data[key]] = data.id;
      }
    }
    this.store[data.id] = data;
    return data;
  }
  get(id) {
    return this.store[id];
  }
  getByIndex(indexName, value) {
    if (!value) {
      value = indexName;
      assert(this.indexs && this.indexs[0], 'default indexName not found');
      indexName = this.indexs[0];
    }
    if (!this.index[indexName] || !this.index[indexName][value]) {
      return;
    }
    const id = this.index[indexName][value];
    return this.store[id];
  }
  remove(id) {
    const item = this.store[id];
    delete this.store[id];
    return item;
  }
  update(id, data) {
    this.store[id] = Object.assign({}, this.store[id], data);
    return this.store[id];
  }
  setIndex(indexs) {
    this.indexs = indexs;
    for (const key of indexs) {
      this.index[key] = this.index[key] || {};
    }
  }
}

class FileStore {
  constructor(storePath, name) {
    assert(storePath && path.isAbsolute(storePath), 'storePath need be an absolute path');
    this.storePath = storePath;
    this.fileId = 0;
    this.vstore = new VStore(name);
    this.load();
  }
  create(data) {
    assert(isObject(data), 'data must be an Object');
    const store = this.vstore.create(data);
    this.save();
    return store;
  }
  set(id, data) {
    assert(isObject(data), 'data must be an Object');
    let store;
    if (!id || !this.vstore.get(id)) {
      store = this.vstore.create(data);
    } else {
      store = this.vstore.update(id, data);
    }
    this.save();
    return store;
  }
  get(id) {
    assert(isNumber(id), 'id must be an number');
    return this.vstore.get(id);
  }
  getByIndex(indexName, value) {
    return this.vstore.getByIndex(indexName, value);
  }
  remove(id) {
    assert(isNumber(id), 'id must be an number');
    return this.vstore.remove(id);
  }
  update(id, data) {
    assert(isNumber(id), 'id must be an number');
    assert(isObject(data), 'data must be an Object');
    return this.vstore.update(id, data);
  }
  save() {
    clearTimeout(this.saved);
    this.saved = setTimeout(() => {
      fs.writeFileSync(`${this.storePath}/${this.vstore.name}/${this.fileId}`, JSON.stringify(this.vstore), 'utf-8');
    }, 100);
  }
  load() {
    const dirpath = `${this.storePath}/${this.vstore.name}`;
    const filepath = `${path}/${this.fileId}`;
    helper.mkdir(dirpath);
    if (fs.existsSync(filepath)) {
      let data = fs.readFileSync(filepath, 'utf-8');
      if (data) {
        data = JSON.parse(data);
        this.vstore = new VStore(data.name, data.id, data.store, data.index);
      }
    }
  }
  index(index) {
    this.vstore.setIndex(index);
  }
}

module.exports = FileStore;
