'use strict';

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isObject(arg) {
  return Object.prototype.toString.call(arg) === '[object Object]';
}
exports.isObject = isObject;
