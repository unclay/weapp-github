'use strict';
const path = require('path');

// had enabled by egg
// exports.static = true;
exports.graphql = {
  enable: true,
  package: 'egg-graphql',
};

exports.weapp = {
  enable: true,
  path: path.resolve(__dirname, '../app/egg-weapp'),
};

exports.localdb = {
  enable: true,
  path: path.resolve(__dirname, '../app/egg-localdb'),
};
